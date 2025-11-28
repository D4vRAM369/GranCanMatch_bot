const db = require('./admin');
const { collections } = require('../config');
const { getDistanceFromLatLonInKm } = require('../utils/distance');

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
        const canFilterByLocation = currentUser.location && currentUser.location.lat && currentUser.location.lon && currentUser.radiusKm;

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
                    if (!user.location || user.location.lat === undefined || user.location.lon === undefined) return false;
                    const distance = getDistanceFromLatLonInKm(
                        currentUser.location.lat,
                        currentUser.location.lon,
                        user.location.lat,
                        user.location.lon
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
