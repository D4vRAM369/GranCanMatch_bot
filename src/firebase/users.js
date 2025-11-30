const db = require('./admin');
const { collections } = require('../config');
const { getDistanceFromLatLonInKm } = require('../utils/distance');

// Umbral de frescura para usar ubicación en tiempo real (ms).
const FRESH_LOCATION_MS = 7 * 60 * 1000; // 7 minutos ≈ margen sobre el push de 5 min.

function normalizeLocation(raw) {
    if (!raw) return null;
    const lat = raw.lat ?? raw.latitude;
    // Aceptamos 'lon' (bot) o 'lng' (app) para mantener compatibilidad.
    const lon = raw.lon ?? raw.lng ?? raw.longitude;
    if (lat === undefined || lon === undefined) return null;
    const updatedAt = raw.updatedAt || raw.timestamp;
    return { lat, lon, updatedAt };
}

function isLocationFresh(loc) {
    if (!loc || !loc.updatedAt) return true; // Si no hay timestamp, no descartamos.
    const ms = typeof loc.updatedAt.toMillis === 'function' ? loc.updatedAt.toMillis() : Number(loc.updatedAt);
    if (!ms || Number.isNaN(ms)) return true;
    return Date.now() - ms <= FRESH_LOCATION_MS;
}

// Crear o actualizar usuario
async function updateUser(userId, data) {
    try {
        await db.collection(collections.users).doc(userId).set({
            ...data,
            lastActive: new Date()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

// Obtener usuario
async function getUser(userId) {
    try {
        const doc = await db.collection(collections.users).doc(userId).get();
        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Obtener candidatos para match
async function getCandidates(currentUser) {
    try {
        const userId = String(currentUser.id);
        const preference = currentUser.preference || 'both';
        const userGender = currentUser.gender;
        const currentLocation = normalizeLocation(currentUser.location);
        const canFilterByLocation = currentLocation && isLocationFresh(currentLocation) && currentUser.radiusKm;

        // 1. Obtener a quién ya he visto
        const seenSnapshot = await db.collection(collections.users).doc(userId).collection(collections.seen).get();
        const seenIds = seenSnapshot.docs.map(doc => doc.id);
        seenIds.push(userId); // Excluirse a uno mismo

        // 2. Query básica
        let query = db.collection(collections.users);

        if (preference !== 'both') {
            query = query.where('gender', '==', preference);
        }

        // 3. Ejecutar y filtrar en memoria (Firestore limitación)
        const snapshot = await query.get();
        const candidates = snapshot.docs
            .map(doc => doc.data())
            .filter(user => {
                if (!user || !user.id) return false;
                if (seenIds.includes(user.id)) return false;
                if (!user.isProfileComplete) return false;

                // Filtrar por preferencia del candidato hacia mí
                const respectsTheirPreference = !user.preference || user.preference === 'both' || user.preference === userGender;
                if (!respectsTheirPreference) return false;

                // Filtrar por distancia si aplica
                if (canFilterByLocation) {
                    const theirLocation = normalizeLocation(user.location);
                    if (!theirLocation || !isLocationFresh(theirLocation)) return false;
                    const distance = getDistanceFromLatLonInKm(
                        currentLocation.lat,
                        currentLocation.lon,
                        theirLocation.lat,
                        theirLocation.lon
                    );
                    if (distance > currentUser.radiusKm) return false;
                    user.distance = distance;
                }

                return true;
            });

        return candidates;
    } catch (error) {
        console.error('Error getting candidates:', error);
        return [];
    }
}

async function deleteUser(userId) {
    try {
        const seenRef = db.collection(collections.users).doc(userId).collection(collections.seen);
        const seenDocs = await seenRef.get();
        const batch = db.batch();
        seenDocs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        await db.collection(collections.users).doc(userId).delete();
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

module.exports = {
    updateUser,
    getUser,
    getCandidates,
    deleteUser
};
