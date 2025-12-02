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
            // Detectar tanto modificaciones como nuevas vinculaciones
            if (change.type === 'modified' || change.type === 'added') {
                const data = change.doc.data();
                const telegramId = change.doc.id;

                console.log(`🔔 Change detected for ${telegramId}: ${change.type}`);

                // Detectar si cambió 'lastTestSignal'
                const lastSignal = data.lastTestSignal;
                if (lastSignal) {
                    const signalTime = lastSignal.toDate();
                    const now = new Date();
                    const diff = now - signalTime;

                    console.log(`📡 Signal received for ${telegramId}. Diff: ${diff}ms`);

                    // Si la señal es de hace menos de 60 segundos (aumentado para evitar problemas de sync/latencia)
                    if (diff < 60000) {
                        bot.telegram.sendMessage(telegramId, `📡 *Señal de prueba recibida*\n\n¡La conexión entre Spots y Telegram funciona correctamente!`, { parse_mode: 'Markdown' })
                            .catch(err => console.error(`Error sending test msg to ${telegramId}:`, err));
                    } else {
                        console.log(`Signal ignored because it's too old (${diff}ms > 60000ms)`);
                    }
                }
            }
        });
    }, err => {
        console.error('Error in Firestore listener:', err);
    });
}

module.exports = { initFirestoreListener };
