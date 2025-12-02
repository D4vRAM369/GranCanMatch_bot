const bot = require('./bot/index');

console.log('🤖 Iniciando GranCanMatch Bot...');

const { initFirestoreListener } = require('./bot/firestoreListener');
const { initMatchNotifier } = require('./bot/matchNotifier');

bot.launch().then(() => {
    console.log('✅ Bot escuchando!');
    initFirestoreListener(bot);
    initMatchNotifier();
}).catch((err) => {
    console.error('❌ Error al iniciar el bot:', err);
});

// Habilitar cierre elegante
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
