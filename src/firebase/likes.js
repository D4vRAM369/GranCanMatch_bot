const db = require('./admin');
const { collections } = require('../config');

async function recordLike(userId, targetId, action) {
    try {
        // 1. Guardar en subcolección 'seen' (Lógica original)
        await db.collection(collections.users).doc(userId).collection(collections.seen).doc(targetId).set({
            action: action,
            timestamp: new Date()
        });

        // 2. Guardar en colección top-level 'likes' (Para mejor trazabilidad y debugging)
        if (action === 'like') {
            const likeId = `${userId}_${targetId}`;
            await db.collection('likes').doc(likeId).set({
                from: userId,
                to: targetId,
                timestamp: new Date()
            });
        }

        return true;
    } catch (error) {
        console.error('Error recording like:', error);
        return false;
    }
}

module.exports = {
    recordLike
};
