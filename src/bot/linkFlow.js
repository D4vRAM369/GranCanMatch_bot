const { spotsDb } = require('../firebase/firebaseDual');
const { Markup } = require('telegraf');

// Generar token y mostrar instrucciones
async function handleLinkCommand(ctx) {
    const telegramId = String(ctx.from.id);

    // Verificación de seguridad: ¿Tenemos conexión con la App?
    if (!spotsDb) {
        console.error('❌ Error: spotsDb no está inicializado. Falta serviceAccountKey-spots.json');
        return ctx.reply('⚠️ Error de configuración en el servidor. El administrador debe añadir la clave de Spots.');
    }

    try {
        // Verificar si ya está vinculado
        const userDoc = await spotsDb.collection('users').doc(telegramId).get();
        if (userDoc.exists && userDoc.data().isLinked) {
            return ctx.reply('✅ Ya tienes tu cuenta vinculada con Spots.\n\nSi necesitas vincular un nuevo dispositivo, ignora este mensaje y usa el código que generaré a continuación, pero ten en cuenta que esto podría desvincular el dispositivo anterior si no usas la misma cuenta de App.');
        }

        // Generamos un token corto (8 caracteres)
        // Usamos Math.random para no depender de librerías externas por ahora
        const token = Math.random().toString(36).substring(2, 10);

        // Guardamos en la DB de SPOTS (spots-b0070)
        await spotsDb.collection('link_requests').doc(token).set({
            telegramId: telegramId,
            createdAt: new Date(),
            status: 'pending'
        });

        const deepLink = `spots://link?token=${token}`;

        const message = `
🔗 *Vincular con Spots*

Para conectar tu cuenta y usar tu ubicación real/fotos:

1. Pulsa el botón de abajo para abrir Spots automáticamente.
2. O ve a Ajustes > Vincular Telegram e introduce: \`${token}\`

_Este código expira en 10 minutos._
        `;

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.url('🚀 Abrir Spots y Vincular', deepLink)
            ])
        });

    } catch (error) {
        console.error('Error generando token de vinculación:', error);
        ctx.reply(`❌ Hubo un error: ${error.message}`);
    }
}

module.exports = { handleLinkCommand };
