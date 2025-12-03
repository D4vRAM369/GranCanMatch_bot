const { Markup } = require('telegraf');
const usersDB = require('../firebase/users');
const likesDB = require('../firebase/likes');
const matchesDB = require('../firebase/matches');
const messages = require('./messages');
const { isValidAge, isValidBio } = require('../utils/validate');

// --- HANDLERS DE ACCIÓN (Botones) ---

async function handleGender(ctx) {
    const userId = String(ctx.from.id);
    const gender = ctx.match[0] === 'gender_male' ? 'male' : 'female';

    await usersDB.updateUser(userId, { gender, step: 'register_preference' });
    ctx.answerCbQuery();

    ctx.editMessageText('¡Genial! ¿Y a quién te gustaría conocer?',
        Markup.inlineKeyboard([
            [Markup.button.callback('Busco Chicas 👩', 'pref_female')],
            [Markup.button.callback('Busco Chicos 👨', 'pref_male')],
            [Markup.button.callback('Ambos 🌈', 'pref_both')]
        ])
    );
}

async function handlePreference(ctx) {
    const userId = String(ctx.from.id);
    const preference = ctx.match[1];

    await usersDB.updateUser(userId, {
        preference,
        step: 'register_age'
    });

    ctx.answerCbQuery();
    ctx.reply('📅 ¿Qué edad tienes?\n\nEscribe solo el número (18-100).');
}

async function handleLikeDislike(ctx) {
    const action = ctx.match[1]; // 'like' o 'pass'
    const targetId = ctx.match[2];
    const userId = String(ctx.from.id);
    const userName = ctx.from.first_name;

    // Registrar acción
    await likesDB.recordLike(userId, targetId, action);

    if (action === 'like') {
        const isMatch = await matchesDB.checkMatch(userId, targetId);

        if (isMatch) {
            // Registrar el match en la colección 'matches' (Nuevo sistema)
            await matchesDB.createMatch(userId, targetId);

            // Obtener datos del target para saber su username
            const targetUser = await usersDB.getUser(targetId);
            const targetName = targetUser ? targetUser.name : 'Alguien';
            const targetUsername = targetUser ? targetUser.username : null;
            const userUsername = ctx.from.username; // Username del usuario actual

            // Notificar a ambos
            await ctx.reply(messages.matchMessageSelf(targetName, targetUsername, targetId), { parse_mode: 'HTML' });
            try {
                await ctx.telegram.sendMessage(targetId, messages.matchMessageTarget(userName, userUsername, userId), { parse_mode: 'HTML' });
            } catch (e) {
                console.log('No se pudo enviar mensaje al match:', e.message);
            }
        } else {
            ctx.reply('❤️ Like enviado. Si le gustas, te avisaré.');
            // Notificación anónima opcional
            try {
                await ctx.telegram.sendMessage(targetId, '👀 ¡Alguien te ha dado like! Usa /buscar para ver si lo encuentras.');
            } catch (e) { }
        }
    } else {
        ctx.reply('❌ Pasaste. Siguiente...');
    }

    ctx.answerCbQuery();
}

async function handlePhoto(ctx) {
    const userId = String(ctx.from.id);
    const photos = ctx.message.photo;

    // La última foto es la de mayor resolución
    const photoId = photos[photos.length - 1].file_id;

    await usersDB.updateUser(userId, { photoId });

    ctx.reply('📸 ¡Foto de perfil actualizada! Se mostrará a las personas que busquen.');
}

async function handleStartOptions(ctx) {
    const action = ctx.match[0];

    if (action === 'start_search') {
        // Llamamos a la función buscar del módulo commands
        // Necesitamos importarla o mover la lógica.
        // Para evitar dependencias circulares, mejor respondemos con texto sugiriendo el comando
        // O usamos ctx.reply y simulamos.
        // Lo más limpio aquí es pedirle que use el comando.
        ctx.reply('¡Vamos a ello! Usa /buscar para empezar.');
    } else if (action === 'start_edit') {
        const userId = String(ctx.from.id);
        await usersDB.updateUser(userId, { step: 'register_gender', isProfileComplete: false });
        ctx.editMessageText('Vamos a actualizar tus datos.\n\n¿Eres chico o chica?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Soy Chico 👨', 'gender_male'), Markup.button.callback('Soy Chica 👩', 'gender_female')]
            ])
        );
    }
    ctx.answerCbQuery();
}

async function handleLocationActions(ctx) {
    const action = ctx.match[0];
    const userId = String(ctx.from.id);

    if (action === 'loc_precise') {
        await usersDB.updateUser(userId, { step: 'register_location' });
        ctx.answerCbQuery();
        ctx.reply(
            'Comparte tu ubicación precisa para filtrar por distancia.',
            Markup.keyboard([
                [Markup.button.locationRequest('Enviar ubicación 📍')],
                [Markup.button.text('Omitir ubicación ➡️')]
            ]).oneTime().resize()
        );
    } else if (action === 'loc_city') {
        await usersDB.updateUser(userId, { step: 'register_location' });
        ctx.answerCbQuery();
        ctx.reply('Escribe tu ciudad o zona (ej. "Las Palmas centro") o "omitir" para saltar.', Markup.removeKeyboard());
    } else if (action === 'loc_off') {
        await usersDB.updateUser(userId, { location: null, city: null, radiusKm: null, step: 'ready', isProfileComplete: true });
        ctx.answerCbQuery();
        ctx.reply('Ubicación desactivada. Se buscará solo por preferencias.');
    } else if (action === 'loc_count') {
        ctx.answerCbQuery();
        const user = await usersDB.getUser(userId);
        if (!user || !user.isProfileComplete) return ctx.reply('Completa tu perfil con /start primero.');

        if (!user.location || !user.radiusKm) {
            return ctx.reply('Para ver cuánta gente hay cerca, activa ubicación precisa y elige un radio con /ubicacion.');
        }

        const candidates = await usersDB.getCandidates(user);
        ctx.reply(`Hay ${candidates.length} personas dentro de tu radio de ${user.radiusKm} km.`);
    }
}

async function handleDeleteActions(ctx) {
    const action = ctx.match[0];
    const userId = String(ctx.from.id);

    if (action === 'delete_yes') {
        const ok = await usersDB.deleteUser(userId);
        ctx.answerCbQuery();
        return ok
            ? ctx.reply('✅ Tu perfil y datos han sido borrados.')
            : ctx.reply('❌ No se pudo borrar tu perfil. Inténtalo de nuevo.');
    }

    if (action === 'delete_no') {
        ctx.answerCbQuery('Operación cancelada.');
    }
}

async function handleRadius(ctx) {
    const userId = String(ctx.from.id);
    const radius = parseInt(ctx.match[1], 10);

    await usersDB.updateUser(userId, {
        radiusKm: radius,
        step: 'ready',
        isProfileComplete: true
    });

    ctx.answerCbQuery();
    ctx.reply(`✅ Radio guardado: ${radius} km.\n\nUsa /buscar para encontrar gente cerca.\nEnvía una foto para mejorar tu perfil.`, Markup.removeKeyboard());
}

async function handleText(ctx) {
    const userId = String(ctx.from.id);
    const text = ctx.message.text.trim();
    const user = await usersDB.getUser(userId);

    if (!user || !user.step) return;

    switch (user.step) {
        case 'register_age':
            if (!isValidAge(text)) {
                return ctx.reply('Introduce una edad válida (solo número entre 18 y 100).');
            }
            await usersDB.updateUser(userId, { age: parseInt(text, 10), step: 'register_bio' });
            ctx.reply('📝 Escribe una breve bio (máx 500 caracteres).\nEjemplo: "Me gustaría conocer genta nueva que me de buena vibra, sin importar lo superficial. Solo gente auténtica: la autenticidad está en peligro de extinción"');
            break;

        case 'register_bio':
            if (!isValidBio(text)) {
                return ctx.reply('Tu bio debe tener entre 1 y 500 caracteres.');
            }
            await usersDB.updateUser(userId, { bio: text, step: 'register_location' });
            ctx.reply(
                '📍 Comparte tu ubicación o escribe tu ciudad/zona.\n\n- Botón para enviar ubicación GPS.\n- O escribe algo como "Las Palmas centro".\n- O escribe "omitir" para saltar.',
                Markup.keyboard([
                    [Markup.button.locationRequest('Enviar ubicación 📍')],
                    [Markup.button.text('Omitir ubicación ➡️')]
                ]).oneTime().resize()
            );
            break;

        case 'register_location':
            if (text.toLowerCase().includes('omitir')) {
                await usersDB.updateUser(userId, { location: null, city: null, step: 'ready', isProfileComplete: true });
                ctx.reply('Perfil completado sin ubicación. Puedes añadirla luego enviando tu ubicación.', Markup.removeKeyboard());
                break;
            }
            await usersDB.updateUser(userId, { city: text, location: null, step: 'ready', isProfileComplete: true });
            ctx.reply('✅ Ciudad guardada. Filtraré por preferencia; añade ubicación GPS para filtros por distancia.', Markup.removeKeyboard());
            break;

        case 'register_radius':
            {
                const radiusNum = parseInt(text, 10);
                if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 200) {
                    return ctx.reply('Introduce un número entre 1 y 200 km para el radio.');
                }
                await usersDB.updateUser(userId, { radiusKm: radiusNum, step: 'ready', isProfileComplete: true });
                ctx.reply(`✅ Radio guardado: ${radiusNum} km.\n\nUsa /buscar para encontrar gente cerca.`, Markup.removeKeyboard());
            }
            break;

        case 'admin_message':
            {
                const { admins: ADMINS } = require('../config');
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
                                `📩 *Mensaje de Usuario*\n\nDe: ${senderName} (ID: ${senderId})\n\n${text}`,
                                { parse_mode: 'Markdown' }
                            );
                            sentCount++;
                        } catch (e) {
                            console.error(`No se pudo enviar al admin ${adminName}:`, e.message);
                        }
                    }
                }

                // Resetear el estado del usuario
                await usersDB.updateUser(userId, { step: 'ready' });

                if (sentCount === 0) {
                    return ctx.reply('⚠️ El administrador no está disponible en este momento.');
                }

                ctx.reply('✅ Tu mensaje ha sido enviado al administrador.');
            }
            break;

        default:
            break;
    }
}

async function handleLocation(ctx) {
    const userId = String(ctx.from.id);
    const user = await usersDB.getUser(userId);
    const { latitude, longitude } = ctx.message.location || {};

    if (!user || !user.step) return;

    if (user.step === 'register_location') {
        await usersDB.updateUser(userId, {
            location: { lat: latitude, lon: longitude },
            city: 'Ubicación compartida',
            step: 'register_radius'
        });

        ctx.reply(
            '📏 ¿A qué distancia quieres ver gente? Elige un radio:',
            Markup.inlineKeyboard([
                [Markup.button.callback('5 km', 'radius_5'), Markup.button.callback('10 km', 'radius_10')],
                [Markup.button.callback('25 km', 'radius_25'), Markup.button.callback('50 km', 'radius_50')]
            ])
        );
    }
}

async function handleAdmin(ctx) {
    const userId = String(ctx.from.id);

    // Responder al callback del botón
    ctx.answerCbQuery();

    // Cambiar el estado del usuario para esperar su mensaje
    await usersDB.updateUser(userId, { step: 'admin_message' });

    ctx.reply(
        '📝 *Enviar mensaje al administrador*\n\n' +
        'Escribe tu mensaje y lo enviaré (verán tu nickname).\n\n' +
        '💡 Usa esto para reportes, sugerencias o problemas.',
        { parse_mode: 'Markdown' }
    );
}

module.exports = {
    handleGender,
    handlePreference,
    handleLikeDislike,
    handlePhoto,
    handleStartOptions,
    handleText,
    handleLocation,
    handleRadius,
    handleLocationActions,
    handleDeleteActions,
    handleAdmin
};
