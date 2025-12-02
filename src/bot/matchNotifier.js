const { spotsDb } = require('../firebase/firebaseDual');

/**
 * Inicializa el listener de nuevos matches.
 * Cuando se crea un nuevo match, notifica a ambos usuarios creando documentos en match_notifications.
 */
function initMatchNotifier() {
    if (!spotsDb) {
        console.error('❌ Cannot init match notifier: spotsDb missing');
        return;
    }

    console.log('🔔 Listening for new matches...');

    // Escuchar cambios en la colección 'matches'
    spotsDb.collection('matches').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async (change) => {
            // Solo procesar nuevos matches
            if (change.type === 'added') {
                const data = change.doc.data();
                const users = data.users || [];

                console.log(`💘 New match detected between: ${users.join(' and ')}`);

                // Notificar a ambos usuarios
                for (const userId of users) {
                    const otherUserId = users.find(u => u !== userId);

                    try {
                        // Obtener datos del otro usuario
                        const otherUserDoc = await spotsDb.collection('users').doc(otherUserId).get();

                        if (!otherUserDoc.exists) {
                            console.log(`⚠️ User ${otherUserId} not found`);
                            continue;
                        }

                        const otherUserData = otherUserDoc.data();

                        // Crear notificación para este usuario
                        await spotsDb.collection('match_notifications').add({
                            userId: userId,
                            matchUserId: otherUserId,
                            matchUserName: otherUserData.name || 'Usuario',
                            matchUserNickname: otherUserData.username,
                            matchUserPhotoId: otherUserData.photoId,
                            timestamp: new Date(),
                            read: false
                        });

                        console.log(`✅ Notification created for user ${userId} about match with ${otherUserData.name}`);
                    } catch (error) {
                        console.error(`❌ Error creating notification for ${userId}:`, error);
                    }
                }
            }
        });
    }, err => {
        console.error('❌ Error in match notifier listener:', err);
    });
}

module.exports = { initMatchNotifier };
