const bot = require('./bot/index');

console.log('🤖 Iniciando GranCanMatch Bot...');

bot.launch().then(() => {
    console.log('✅ Bot escuchando!');
}).catch((err) => {
    console.error('❌ Error al iniciar el bot:', err);
});

// Habilitar cierre elegante
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
