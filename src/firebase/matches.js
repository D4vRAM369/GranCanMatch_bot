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

async function getUserMatches(userId) {
    try {
        // 1. Obtener a quién he dado like
        const myLikesSnapshot = await db.collection(collections.users)
            .doc(userId)
            .collection(collections.seen)
            .where('action', '==', 'like')
            .get();

        const matches = [];

        // 2. Verificar si ellos me dieron like a mí
        for (const doc of myLikesSnapshot.docs) {
            const targetId = doc.id;
            const targetLike = await db.collection(collections.users)
                .doc(targetId)
                .collection(collections.seen)
                .doc(userId)
                .get();

            if (targetLike.exists && targetLike.data().action === 'like') {
                // Es un match, obtener datos del usuario
                const userDoc = await db.collection(collections.users).doc(targetId).get();
                if (userDoc.exists) {
                    matches.push(userDoc.data());
                }
            }
        }

        return matches;
    } catch (error) {
        console.error('Error getting matches:', error);
        return [];
    }
}

module.exports = {
    checkMatch,
    getUserMatches
};
