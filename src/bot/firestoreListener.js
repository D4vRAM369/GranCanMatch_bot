const { spotsDb } = require('../firebase/firebaseDual');

function initFirestoreListener(bot) {
    if (!spotsDb) {
        console.error('❌ Cannot init listener: spotsDb missing');
        return;
    }

    console.log('🎧 Listening for Firestore updates...');

    // Escuchar cambios en la colección 'users'
    // Filtramos solo los que tienen 'isLinked' == true para ahorrar recursos si fuera posible,
    // pero Firestore listeners son a nivel de query.
    const query = spotsDb.collection('users').where('isLinked', '==', true);

    query.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'modified') {
                const data = change.doc.data();
                const telegramId = change.doc.id;

                // Detectar si cambió 'lastTestSignal'
                // En un caso real, compararíamos con el valor anterior, pero aquí simplificamos.
                // Si el timestamp es muy reciente (menos de 10s), notificamos.

                const lastSignal = data.lastTestSignal;
                if (lastSignal) {
                    const signalTime = lastSignal.toDate();
                    const now = new Date();
                    const diff = now - signalTime;

                    // Si la señal es de hace menos de 5 segundos, asumimos que es nueva
                    if (diff < 5000) {
                        bot.telegram.sendMessage(telegramId, `📡 *Señal de prueba recibida*\n\n¡La conexión entre Spots y Telegram funciona correctamente!`, { parse_mode: 'Markdown' })
                            .catch(err => console.error(`Error sending test msg to ${telegramId}:`, err));
                    }
                }
            }
        });
    }, err => {
        console.error('Error in Firestore listener:', err);
    });
}

module.exports = { initFirestoreListener };
