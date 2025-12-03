const { Markup } = require('telegraf');
const usersDB = require('../firebase/users');
const messages = require('./messages');
const { admins: ADMINS } = require('../config');

// --- COMANDOS ---

async function start(ctx) {
    const userId = String(ctx.from.id);
    const name = ctx.from.first_name;
    const username = ctx.from.username || 'Anónimo';

    // Verificar si ya existe
    const existingUser = await usersDB.getUser(userId);

    if (existingUser && existingUser.isProfileComplete) {
        // Si ya existe y completó el perfil, solo actualizamos datos básicos pero no el paso
        await usersDB.updateUser(userId, {
            name: name,
            username: username,
            lastActive: new Date()
        });

        return ctx.reply(`¡Hola de nuevo ${name}! 👋\n\nTu perfil sigue activo. ¿Qué quieres hacer?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Buscar Personas 🔍', 'start_search')],
                [Markup.button.callback('Editar Perfil ✏️', 'start_edit')]
            ])
        );
    }

    // Si es nuevo o no completó, flujo normal
    await usersDB.updateUser(userId, {
        id: userId,
        name: name,
        username: username,
        step: 'register_gender',
        isProfileComplete: false
    });

    ctx.reply(messages.welcomeMessage(name),
        Markup.inlineKeyboard([
            [Markup.button.callback('Soy Chico 👨', 'gender_male'), Markup.button.callback('Soy Chica 👩', 'gender_female')]
        ])
    );
}

async function matches(ctx) {
    const userId = String(ctx.from.id);
    const matchesList = await require('../firebase/matches').getUserMatches(userId);

    if (matchesList.length === 0) {
        return ctx.reply('Aún no tienes matches. ¡Sigue buscando! 🔍');
    }

    let message = '🔥 **Tus Matches** 🔥\n\n';

    matchesList.forEach(user => {
        const link = user.username && user.username !== 'Anónimo'
            ? `https://t.me/${user.username}`
            : `tg://user?id=${user.id}`;

        message += `• [${user.name}](${link})\n`;
    });

    ctx.reply(message, { parse_mode: 'Markdown' });
}

async function perfil(ctx) {
    const userId = String(ctx.from.id);
    const user = await usersDB.getUser(userId);

    if (!user) return ctx.reply('No tienes perfil. Usa /start');

    const genderMap = { male: 'Chico 👨', female: 'Chica 👩' };
    const prefMap = { male: 'Chicos 👨', female: 'Chicas 👩', both: 'Ambos 🌈' };
    const locationText = user.location
        ? `Ubicación: 📍 ${user.city || 'Compartida'} (radio ${user.radiusKm || 25} km)`
        : user.city ? `Ciudad: ${user.city}` : 'Ubicación: no indicada';

    const text = `👤 *Tu Perfil*\n\nNombre: ${user.name}\nEdad: ${user.age || 'No indicada'}\nGénero: ${genderMap[user.gender] || user.gender}\nBuscas: ${prefMap[user.preference] || user.preference}\n${locationText}\nBio: ${user.bio || 'Sin bio'}`;

    if (user.photoId) {
        await ctx.replyWithPhoto(user.photoId, { caption: text, parse_mode: 'Markdown' });
    } else {
        await ctx.reply(text, { parse_mode: 'Markdown' });
        ctx.reply('💡 Tip: Envía una foto al chat para ponerla en tu perfil.');
    }
}

async function buscar(ctx) {
    const userId = String(ctx.from.id);
    const user = await usersDB.getUser(userId);

    if (!user) return ctx.reply('Usa /start primero.');
    if (!user.isProfileComplete) return ctx.reply('Termina tu registro con /start');

    const candidates = await usersDB.getCandidates(user);

    if (candidates.length === 0) {
        return ctx.reply(messages.noCandidatesMessage);
    }

    // Seleccionar uno aleatorio
    const candidate = candidates[Math.floor(Math.random() * candidates.length)];

    const distanceText = candidate.distance ? `\nDistancia: ~${candidate.distance.toFixed(1)} km` : '';
    const bioText = candidate.bio ? `\nBio: ${candidate.bio}` : '';

    const caption = `👤 <b>${candidate.name}</b> ${candidate.age ? `(${candidate.age})` : ''}${distanceText}${bioText}\n\n¿Te gusta?`;
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('❌ Pasó', `pass_${candidate.id}`),
            Markup.button.callback('❤️ Me gusta', `like_${candidate.id}`)
        ]
    ]);

    if (candidate.photoId) {
        await ctx.replyWithPhoto(candidate.photoId, {
            caption: caption,
            parse_mode: 'HTML',
            ...keyboard
        });
    } else {
        await ctx.reply(caption, {
            parse_mode: 'HTML',
            ...keyboard
        });
    }
}

async function ayuda(ctx) {
    ctx.reply(messages.helpMessage, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('📩 Contactar Administrador', 'admin_contact')]
        ])
    });
}

async function foto(ctx) {
    ctx.reply('📸 Para cambiar tu foto de perfil, simplemente **envíame la foto** aquí mismo en el chat (como si se la enviaras a un amigo).', { parse_mode: 'Markdown' });
}

async function borrar(ctx) {
    ctx.reply(
        '⚠️ ¿Seguro que quieres borrar tu perfil y tus datos?\nEsto eliminará tus likes y preferencias.',
        Markup.inlineKeyboard([
            [Markup.button.callback('Sí, borrar', 'delete_yes'), Markup.button.callback('Cancelar', 'delete_no')]
        ])
    );
}

async function ubicacion(ctx) {
    const userId = String(ctx.from.id);
    const user = await usersDB.getUser(userId);

    const current = user && user.location ? `Ubicación: activa (radio ${user.radiusKm || '25'} km)` : user && user.city ? `Ubicación aproximada: ${user.city}` : 'Ubicación: desactivada';

    ctx.reply(
        `📍 Configurar ubicación\n${current}\n\nElige una opción:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('Precisa (GPS)', 'loc_precise'), Markup.button.callback('Aproximada (Ciudad)', 'loc_city')],
            [Markup.button.callback('Desactivar ubicación', 'loc_off')],
            [Markup.button.callback('Personas cerca ➜', 'loc_count')]
        ])
    );
}

async function users(ctx) {
    // Seguridad: Solo los admins definidos pueden usar este comando
    if (!ADMINS.includes(ctx.from.username)) {
        return; // Ignorar silenciosamente
    }

    try {
        const allUsers = await usersDB.getAllUsers();
        const json = JSON.stringify(allUsers, null, 2);

        await ctx.replyWithDocument({
            source: Buffer.from(json),
            filename: `users_dump_${new Date().toISOString().split('T')[0]}.json`
        });
    } catch (error) {
        console.error('Error en comando /users:', error);
        ctx.reply('❌ Error al exportar usuarios.');
    }
}

async function admin(ctx) {
    const message = ctx.message.text.split(' ').slice(1).join(' ');
    if (!message) return ctx.reply('📝 Uso: /admin <tu mensaje para el administrador>');

    try {
        const senderName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
        const senderId = ctx.from.id;
        let sentCount = 0;

        // Intentar enviar a todos los admins
        for (const adminName of ADMINS) {
            const adminUser = await usersDB.getUserByUsername(adminName);
            if (adminUser) {
                try {
                    await ctx.telegram.sendMessage(
                        adminUser.id,
                        `📩 *Mensaje Anónimo (Admin)*\n\nDe: ${senderName} (ID: ${senderId})\n\n${message}`,
                        { parse_mode: 'Markdown' }
                    );
                    sentCount++;
                } catch (e) {
                    console.error(`No se pudo enviar al admin ${adminName}:`, e.message);
                }
            }
        }

        if (sentCount === 0) {
            return ctx.reply('⚠️ El administrador no está disponible en este momento.');
        }

        ctx.reply('✅ Tu mensaje ha sido enviado al administrador.');

    } catch (error) {
        console.error('Error enviando mensaje al admin:', error);
        ctx.reply('❌ Hubo un error al enviar el mensaje.');
    }
}

async function promo(ctx) {
    // Seguridad: Solo los admins definidos pueden usar este comando
    if (!ADMINS.includes(ctx.from.username)) {
        return ctx.reply('⚠️ Solo los administradores pueden usar este comando.');
    }

    try {
        const allUsers = await usersDB.getAllUsers();
        const totalUsers = allUsers.length;

        // Generar link del bot
        const botUsername = ctx.botInfo.username;
        const botLink = `https://t.me/${botUsername}`;

        const promoMessage = `
🌟 *¡Hey!* 🌟

Somos ya *${totalUsers} usuarios* unidos en GranCanMatch_bot 🌴

📢 *Comparte este link* para que este proyecto sea viable:
t.me/CitasEnLasPalmas\\_bot

Que este proyecto sea posible *depende de ustedes*: yo solo he puesto la infraestructura, los medios y el VPS para que funcione sin interrupciones.

Un abrazo para todos/as, y gracias de antemano 💙

*Fdo: D4vRAM369*
        `.trim();

        let sentCount = 0;
        let errorCount = 0;

        // Enviar a todos los usuarios
        for (const user of allUsers) {
            try {
                await ctx.telegram.sendMessage(user.id, promoMessage, { parse_mode: 'Markdown' });
                sentCount++;
                // Pequeña pausa para evitar rate limits de Telegram (30 msgs/segundo)
                await new Promise(resolve => setTimeout(resolve, 35));
            } catch (e) {
                errorCount++;
                console.error(`No se pudo enviar promo a ${user.id}:`, e.message);
            }
        }

        ctx.reply(
            `✅ *Promoción enviada*\n\n` +
            `📊 Enviados: ${sentCount}\n` +
            `❌ Errores: ${errorCount}\n` +
            `👥 Total usuarios: ${totalUsers}`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en comando /promo:', error);
        ctx.reply('❌ Error al enviar la promoción.');
    }
}

async function message(ctx) {
    // Seguridad: Solo los admins definidos pueden usar este comando
    if (!ADMINS.includes(ctx.from.username)) {
        return ctx.reply('⚠️ Solo los administradores pueden usar este comando.');
    }

    // Obtener el mensaje después del comando
    const customMessage = ctx.message.text.split(' ').slice(1).join(' ');

    if (!customMessage) {
        return ctx.reply(
            '📝 *Uso del comando /message*\n\n' +
            'Escribe: `/message Tu mensaje aquí`\n\n' +
            'El mensaje se enviará a todos los usuarios registrados.\n\n' +
            '💡 Puedes usar formato Markdown:\n' +
            '- `*negrita*` para *negrita*\n' +
            '- `_cursiva_` para _cursiva_\n' +
            '- `` `código` `` para `código`',
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const allUsers = await usersDB.getAllUsers();
        const totalUsers = allUsers.length;

        let sentCount = 0;
        let errorCount = 0;

        // Enviar a todos los usuarios
        for (const user of allUsers) {
            try {
                await ctx.telegram.sendMessage(user.id, customMessage, { parse_mode: 'Markdown' });
                sentCount++;
                // Pequeña pausa para evitar rate limits de Telegram (30 msgs/segundo)
                await new Promise(resolve => setTimeout(resolve, 35));
            } catch (e) {
                errorCount++;
                console.error(`No se pudo enviar mensaje a ${user.id}:`, e.message);
            }
        }

        ctx.reply(
            `✅ *Mensaje enviado*\n\n` +
            `📊 Enviados: ${sentCount}\n` +
            `❌ Errores: ${errorCount}\n` +
            `👥 Total usuarios: ${totalUsers}`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en comando /message:', error);
        ctx.reply('❌ Error al enviar el mensaje.');
    }
}

module.exports = {
    start,
    perfil,
    buscar,
    ayuda,
    foto,
    matches,
    ubicacion,
    borrar,
    users,
    admin,
    promo,
    message,
    link: require('./linkFlow').handleLinkCommand
};
