const db = require('../firebase/admin');
const { v4: uuidv4 } = require('uuid');
const { Markup } = require('telegraf');

// Generar token y mostrar instrucciones
async function handleLinkCommand(ctx) {
    const telegramId = String(ctx.from.id);

    // Generamos un token corto (8 caracteres)
    // const token = uuidv4().split('-')[0]; 
    // Reemplazo temporal para evitar problemas con uuid
    const token = Math.random().toString(36).substring(2, 10);

    try {
        // Guardamos la intención de vinculación en Firestore
        // Expira en 10 minutos (podríamos usar TTL en Firestore o validarlo en la app)
        await db.collection('link_requests').doc(token).set({
            telegramId: telegramId,
            createdAt: new Date(),
            status: 'pending'
        });

        const message = `
🔗 *Vincular con Spots*

Para conectar tu cuenta y usar tu ubicación real/fotos:

1. Abre la App *Spots*.
2. Ve a Ajustes > Vincular Telegram.
3. Introduce este código: \`${token}\`

_Este código expira en 10 minutos._
        `;

        const deepLink = `spots://link?token=${token}`;

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('🔓 Abrir Spots y Vincular', deepLink)]
            ])
        });

    } catch (error) {
        console.error('Error generando token de vinculación:', error);
        ctx.reply(`❌ Hubo un error: ${error.message}`);
    }
}

module.exports = { handleLinkCommand };
