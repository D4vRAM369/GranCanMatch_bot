const db = require('./admin');
const { collections } = require('../config');

async function checkMatch(userId, targetId) {
    try {
        // Verificar si el target ya le dio like al user
        const targetLike = await db.collection(collections.users).doc(targetId).collection(collections.seen).doc(userId).get();
        return targetLike.exists && targetLike.data().action === 'like';
    } catch (error) {
        console.error('Error checking match:', error);
        return false;
    }
}

async function createMatch(userId, targetId) {
    try {
        // ID único ordenado para evitar duplicados (ej. "123_456")
        const matchId = [userId, targetId].sort().join('_');

        await db.collection('matches').doc(matchId).set({
            users: [userId, targetId],
            timestamp: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error creating match:', error);
        return false;
    }
}

async function getUserMatches(userId) {
    try {
        // 1. Intentar obtener de la colección 'matches' (Más eficiente)
        const snapshot = await db.collection('matches')
            .where('users', 'array-contains', userId)
            .get();

        const matches = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const otherId = data.users.find(id => id !== userId);

            if (otherId) {
                const userDoc = await db.collection(collections.users).doc(otherId).get();
                if (userDoc.exists) {
                    matches.push(userDoc.data());
                }
            }
        }

        // 2. Obtener matches del método antiguo (Legacy)
        // Esto asegura que no "perdemos" los matches viejos si ya tenemos nuevos
        const legacyMatches = await getUserMatchesLegacy(userId);

        // 3. Combinar y eliminar duplicados
        const allMatches = [...matches];
        const seenIds = new Set(matches.map(m => m.id));

        for (const legacyMatch of legacyMatches) {
            if (!seenIds.has(legacyMatch.id)) {
                allMatches.push(legacyMatch);
                seenIds.add(legacyMatch.id);
            }
        }

        return allMatches;
    } catch (error) {
        console.error('Error getting matches:', error);
        return [];
    }
}

// Método antiguo (basado en 'seen')
async function getUserMatchesLegacy(userId) {
    try {
        const myLikesSnapshot = await db.collection(collections.users)
            .doc(userId)
            .collection(collections.seen)
            .where('action', '==', 'like')
            .get();

        const matches = [];

        for (const doc of myLikesSnapshot.docs) {
            const targetId = doc.id;
            const targetLike = await db.collection(collections.users)
                .doc(targetId)
                .collection(collections.seen)
                .doc(userId)
                .get();

            if (targetLike.exists && targetLike.data().action === 'like') {
                const userDoc = await db.collection(collections.users).doc(targetId).get();
                if (userDoc.exists) {
                    matches.push(userDoc.data());
                }
            }
        }
        return matches;
    } catch (error) {
        console.error('Error in legacy matches:', error);
        return [];
    }
}

module.exports = {
    checkMatch,
    createMatch,
    getUserMatches
};
