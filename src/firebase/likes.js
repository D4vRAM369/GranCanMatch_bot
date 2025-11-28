const db = require('./admin');
const { collections } = require('../config');

async function recordLike(userId, targetId, action) {
    try {
        await db.collection(collections.users).doc(userId).collection(collections.seen).doc(targetId).set({
            action: action,
            timestamp: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error recording like:', error);
        return false;
    }
}

module.exports = {
    recordLike
};
