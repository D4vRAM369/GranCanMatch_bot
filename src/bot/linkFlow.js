const { db } = require('../firebase/admin');
const { v4: uuidv4 } = require('uuid');
const { Markup } = require('telegraf');

// Generar token y mostrar instrucciones
async function handleLinkCommand(ctx) {
    const telegramId = String(ctx.from.id);

    // Generamos un token corto (8 caracteres)
    const token = uuidv4().split('-')[0];

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

        // Si tuviéramos Deep Links configurados:
        // const deepLink = `spots://link?token=${token}`;
        // Markup.button.url('🔓 Abrir Spots', deepLink)

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error generando token de vinculación:', error);
        ctx.reply('❌ Hubo un error al generar el código. Inténtalo de nuevo más tarde.');
    }
}

module.exports = { handleLinkCommand };
