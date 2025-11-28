const { Markup } = require('telegraf');
const usersDB = require('../firebase/users');
const messages = require('./messages');

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
    ctx.reply(messages.helpMessage, { parse_mode: 'Markdown' });
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

module.exports = {
    start,
    perfil,
    buscar,
    ayuda,
    foto,
    matches,
    ubicacion,
    borrar
};
