require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

// 1. Inicializar el bot con el token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Base de datos en memoria (temporal, se borrará al reiniciar)
// Base de datos (Firebase)
const db = require('./firebase');

// 2. Comando /start - El punto de entrada
// 2. Comando /start - El punto de entrada
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name;

    // Guardamos info básica en Firebase
    try {
        await db.collection('users').doc(String(userId)).set({
            name: name,
            step: 'register_gender',
            createdAt: new Date()
        }, { merge: true });

        ctx.reply(`¡Hola ${name}! 👋 Bienvenido a Las Palmas MatchBot, un lugar donde buscar palike en Gran Canaria fuera de las redes convencionales tipo Tinder y derivadas mierdas que monetizan y mercantilizan los vínculos emocionales. \n\n Desarrollado por D4vRAM. Más info sobre el creador del bot en: https://github.com/D4vRAM369 \n\nPara empezar, cuéntame un poco sobre ti.\n¿Eres chico o chica?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Soy Chico 👨', 'gender_male'), Markup.button.callback('Soy Chica 👩', 'gender_female')]
            ])
        );
    } catch (error) {
        console.error('Error guardando usuario:', error);
        ctx.reply('Hubo un error al registrarte. Inténtalo de nuevo.');
    }
});

// Comando /ayuda - Menú de ayuda
bot.command('ayuda', (ctx) => {
    const helpText = `📚 **MENÚ DE AYUDA**\n\n` +
        `**Comandos disponibles:**\n\n` +
        `/start - Registrarte o reiniciar tu perfil\n` +
        `/buscar - Buscar personas y darles like\n` +
        `/matches - Ver tus matches y chatear\n` +
        `/perfil - Ver tu perfil actual\n` +
        `/editar - Editar tu perfil (edad, zona, bio, foto)\n` +
        `/ayuda - Mostrar este menú\n\n` +
        `**¿Cómo funciona?**\n` +
        `1️⃣ Regístrate con /start\n` +
        `2️⃣ Completa tu perfil (género, edad, zona, bio, foto)\n` +
        `3️⃣ Usa /buscar para ver personas\n` +
        `4️⃣ Dale ❤️ a quien te guste\n` +
        `5️⃣ Si esa persona también te da like → ¡MATCH!\n` +
        `6️⃣ Usa /matches para chatear con tus matches\n\n` +
        `**Privacidad:**\n` +
        `🔒 Solo puedes chatear con gente que también te dio like.\n` +
        `🔒 Tus likes son privados hasta que haya match.\n\n` +
        `💡 **Tip:** Dale "� No es mi tipo" para pasar a la siguiente persona.\n\n` +
        `¿Dudas? Contacta al creador: https://github.com/D4vRAM369`;

    ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// Comando /debug - Ver todos los usuarios (temporal, para debugging)
bot.command('debug', async (ctx) => {
    try {
        const usersSnapshot = await db.collection('users').get();

        let debugText = '🔧 **DEBUG - Usuarios en DB:**\\n\\n';

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            debugText += `**ID:** ${doc.id}\\n`;
            debugText += `Nombre: ${data.name}\\n`;
            debugText += `Género: ${data.gender || 'N/A'}\\n`;
            debugText += `Busca: ${data.preference || 'N/A'}\\n`;
            debugText += `Step: ${data.step || 'N/A'}\\n`;
            debugText += `---\\n`;
        });

        ctx.reply(debugText, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error en debug:', error);
        ctx.reply('Error al obtener datos de debug.');
    }
});


// Comando /editar - Editar perfil
bot.command('editar', async (ctx) => {
    const userId = ctx.from.id;

    try {
        const userDoc = await db.collection('users').doc(String(userId)).get();

        if (!userDoc.exists) {
            return ctx.reply('❌ No tienes perfil. Usa /start para registrarte.');
        }

        ctx.reply('✏️ **¿Qué quieres editar?**\n\nSelecciona una opción:',
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🎂 Edad', 'edit_age')],
                    [Markup.button.callback('📍 Zona', 'edit_zone')],
                    [Markup.button.callback('📝 Bio', 'edit_bio')],
                    [Markup.button.callback('📸 Foto', 'edit_photo')],
                    [Markup.button.callback('❌ Cancelar', 'edit_cancel')]
                ])
            }
        );
    } catch (error) {
        console.error('Error en editar:', error);
        ctx.reply('Hubo un error. Inténtalo de nuevo.');
    }
});

// Manejadores de edición
bot.action('edit_age', async (ctx) => {
    const userId = ctx.from.id;
    await db.collection('users').doc(String(userId)).update({ step: 'editing_age' });
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('🎂 Escribe tu nueva edad (18-99):');
});

bot.action('edit_zone', async (ctx) => {
    const userId = ctx.from.id;
    await db.collection('users').doc(String(userId)).update({ step: 'editing_zone' });
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('📍 Escribe tu nueva zona (ej: Las Palmas, Telde, Sur...):');
});

bot.action('edit_bio', async (ctx) => {
    const userId = ctx.from.id;
    await db.collection('users').doc(String(userId)).update({ step: 'editing_bio' });
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('📝 Escribe tu nueva bio (máx 200 caracteres):');
});

bot.action('edit_photo', async (ctx) => {
    const userId = ctx.from.id;
    await db.collection('users').doc(String(userId)).update({ step: 'editing_photo' });
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('📸 Envía tu nueva foto:',
        Markup.inlineKeyboard([
            [Markup.button.callback('🗑️ Eliminar foto actual', 'delete_photo')]
        ])
    );
});

bot.action('delete_photo', async (ctx) => {
    const userId = ctx.from.id;
    await db.collection('users').doc(String(userId)).update({
        photoId: null,
        step: 'ready'
    });
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('✅ Foto eliminada. Ahora tu perfil no tiene foto.');
});

bot.action('edit_cancel', async (ctx) => {
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('❌ Edición cancelada.');
});



// 3. Manejar la respuesta del género
bot.action('gender_male', async (ctx) => {
    const userId = ctx.from.id;
    try {
        await db.collection('users').doc(String(userId)).set({
            gender: 'male',
            step: 'register_age' // Siguiente paso: Edad
        }, { merge: true });

        ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
        ctx.reply('¿Qué edad tienes? (Escribe solo el número, ej: 25)');
    } catch (error) {
        console.error(error);
    }
});

bot.action('gender_female', async (ctx) => {
    const userId = ctx.from.id;
    try {
        await db.collection('users').doc(String(userId)).set({
            gender: 'female',
            step: 'register_age' // Siguiente paso: Edad
        }, { merge: true });

        ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
        ctx.reply('¿Qué edad tienes? (Escribe solo el número, ej: 25)');
    } catch (error) {
        console.error(error);
    }
});

// Función auxiliar para preguntar qué busca
function askPreference(ctx) {
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Busco Chicas 👩', 'pref_female')],
        [Markup.button.callback('Busco Chicos 👨', 'pref_male')],
        [Markup.button.callback('Ambos 🌈', 'pref_both')]
    ]);

    // Si venimos de un botón (Callback), editamos para que quede bonito
    if (ctx.callbackQuery) {
        ctx.editMessageText('¡Genial! ¿Y a quién te gustaría conocer?', keyboard).catch(() => {
            // Si falla la edición (ej: mensaje muy viejo), enviamos uno nuevo
            ctx.reply('¡Genial! ¿Y a quién te gustaría conocer?', keyboard);
        });
    } else {
        // Si venimos de texto (ej: después de poner la Zona), enviamos mensaje nuevo
        ctx.reply('¡Genial! ¿Y a quién te gustaría conocer?', keyboard);
    }
}

// 4. Manejar la preferencia
// 4. Manejar la preferencia
// 4. Manejar la preferencia
// 4. Manejar la preferencia
bot.action(/pref_(.+)/, async (ctx) => {
    const userId = ctx.from.id;
    const preference = ctx.match[1];

    try {
        await db.collection('users').doc(String(userId)).update({
            preference: preference,
            step: 'register_bio' // Siguiente paso: Bio
        });

        ctx.reply('� Escribe una breve descripción sobre ti (Bio).\nEj: "Me gusta el senderismo y el cine."');
        ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    } catch (error) {
        console.error(error);
    }
});

// 5. Manejar la foto (o el salto)
bot.action('skip_photo', async (ctx) => {
    const userId = ctx.from.id;
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    await finishRegistration(ctx, userId, null);
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;

    // Verificar si el usuario está en el paso correcto
    const userDoc = await db.collection('users').doc(String(userId)).get();
    if (!userDoc.exists) {
        return ctx.reply('⚠️ Por favor, usa /start para registrarte.');
    }

    const userData = userDoc.data();

    // Telegram manda varias versiones, la última es la de mayor calidad
    const photos = ctx.message.photo;
    const fileId = photos[photos.length - 1].file_id;

    // Si está registrándose
    if (userData.step === 'register_photo') {
        await finishRegistration(ctx, userId, fileId);
    }
    // Si está editando la foto
    else if (userData.step === 'editing_photo') {
        await db.collection('users').doc(String(userId)).update({
            photoId: fileId,
            step: 'ready'
        });
        ctx.reply('✅ Foto actualizada correctamente.');
    }
    // Si no está en ningún paso válido
    else {
        ctx.reply('⚠️ Por favor, usa los comandos o botones.');
    }
});

async function finishRegistration(ctx, userId, photoId) {
    try {
        const updateData = { step: 'ready' };
        if (photoId) updateData.photoId = photoId;

        await db.collection('users').doc(String(userId)).update(updateData);

        // Recuperar datos para confirmar
        const userDoc = await db.collection('users').doc(String(userId)).get();
        const userData = userDoc.data();

        ctx.reply(`¡Genial! 🎉 Registro completado.\n\nEres: ${userData.gender === 'male' ? 'Chico' : 'Chica'}\nBuscas: ${userData.preference}\n${photoId ? '📸 Foto: Sí' : '🕵️ Foto: No'}\n\nEscribe /buscar para encontrar a alguien.`);
    } catch (error) {
        console.error('Error finalizando:', error);
        ctx.reply('Hubo un error. Intenta /start de nuevo.');
    }
}

// 5. Comando /buscar (Simulado)
// 5. Comando /buscar (REAL)
bot.command('buscar', async (ctx) => {
    const userId = ctx.from.id;
    ctx.reply('🔍 Buscando personas compatibles en la base de datos...');

    try {
        // 1. Obtener mis datos para saber qué busco
        const myDoc = await db.collection('users').doc(String(userId)).get();
        const me = myDoc.data();

        if (!me || !me.preference) {
            return ctx.reply('⚠️ Primero debes registrarte. Escribe /start');
        }

        // 2. Preparar la consulta (Query)
        let usersRef = db.collection('users');
        let query;

        // Si busco "Ambos", traigo todos, si no, filtro por género
        if (me.preference === 'both') {
            query = usersRef.where('step', '==', 'ready'); // Solo usuarios que terminaron el registro
        } else {
            query = usersRef
                .where('gender', '==', me.preference)
                .where('step', '==', 'ready');
        }

        const snapshot = await query.get();

        // 3. Filtrar (No puedo hacerme match a mí mismo)
        const matches = [];
        snapshot.forEach(doc => {
            if (doc.id !== String(userId)) {
                matches.push({ id: doc.id, ...doc.data() });
            }
        });

        if (matches.length === 0) {
            return ctx.reply('💔 No he encontrado a nadie compatible aún. ¡Dile a tus amigos que usen el bot para que haya más gente!');
        }

        // 4. Elegir uno al azar
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];

        // Construir ficha completa del match
        const genderEmoji = randomMatch.gender === 'male' ? '👨' : '👩';
        const ageText = randomMatch.age ? `${randomMatch.age} años` : 'N/A';
        const zoneText = randomMatch.zone || 'No especificada';
        const bioText = randomMatch.bio || 'Sin descripción';

        const caption = `✨ **¡He encontrado a alguien!**\n\n` +
            `👤 **${randomMatch.name}** ${genderEmoji}\n` +
            `🎂 Edad: ${ageText}\n` +
            `📍 Zona: ${zoneText}\n\n` +
            `💬 _"${bioText}"_\n\n` +
            `¿Te interesa? ¡Envíale un mensaje!`;

        if (randomMatch.photoId) {
            await ctx.replyWithPhoto(randomMatch.photoId, {
                caption: caption,
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👋 Enviar mensaje', `msg_${randomMatch.id}`)],
                    [Markup.button.callback('🔄 Buscar otro/a', 'search_again')]
                ])
            });
        } else {
            await ctx.reply(caption,
                {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('👋 Enviar mensaje', `msg_${randomMatch.id}`)],
                        [Markup.button.callback('🔄 Buscar otro/a', 'search_again')]
                    ])
                }
            );
        }

    } catch (error) {
        console.error('Error en buscar:', error);
        ctx.reply('❌ Hubo un error al buscar. Inténtalo de nuevo.');
    }
});

// 6. Botón "Buscar otro/a"
bot.action('search_again', async (ctx) => {
    ctx.answerCbQuery().catch(err => console.log('Botón viejo:', err.message));
    // Simulamos que el usuario escribió /buscar
    ctx.reply('🔄 Buscando otra persona...');

    // Reutilizamos la lógica de búsqueda
    const userId = ctx.from.id;

    try {
        const myDoc = await db.collection('users').doc(String(userId)).get();
        const me = myDoc.data();

        if (!me || !me.preference) {
            return ctx.reply('⚠️ Primero debes registrarte. Escribe /start');
        }

        let usersRef = db.collection('users');
        let query;

        if (me.preference === 'both') {
            query = usersRef.where('step', '==', 'ready');
        } else {
            query = usersRef
                .where('gender', '==', me.preference)
                .where('step', '==', 'ready');
        }

        const snapshot = await query.get();
        const matches = [];
        snapshot.forEach(doc => {
            if (doc.id !== String(userId)) {
                matches.push({ id: doc.id, ...doc.data() });
            }
        });

        if (matches.length === 0) {
            return ctx.reply('💔 No he encontrado a nadie más compatible.');
        }

        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        const genderEmoji = randomMatch.gender === 'male' ? '👨' : '👩';
        const ageText = randomMatch.age ? `${randomMatch.age} años` : 'N/A';
        const zoneText = randomMatch.zone || 'No especificada';
        const bioText = randomMatch.bio || 'Sin descripción';

        const caption = `✨ **¡He encontrado a alguien!**\n\n` +
            `👤 **${randomMatch.name}** ${genderEmoji}\n` +
            `🎂 Edad: ${ageText}\n` +
            `📍 Zona: ${zoneText}\n\n` +
            `💬 _"${bioText}"_\n\n` +
            `¿Te gusta? Dale like!`;

        if (randomMatch.photoId) {
            await ctx.replyWithPhoto(randomMatch.photoId, {
                caption: caption,
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('❤️ Me gusta', `like_${randomMatch.id}`)],
                    [Markup.button.callback('� No es mi tipo', 'pass')],
                    [Markup.button.callback('�🔄 Buscar otro/a', 'search_again')]
                ])
            });
        } else {
            await ctx.reply(caption, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('❤️ Me gusta', `like_${randomMatch.id}`)],
                    [Markup.button.callback('👎 No es mi tipo', 'pass')],
                    [Markup.button.callback('🔄 Buscar otro/a', 'search_again')]
                ])
            });
        }
    } catch (error) {
        console.error('Error en buscar:', error);
        ctx.reply('❌ Hubo un error al buscar. Inténtalo de nuevo.');
    }
});

// 7. Botón "Pass" (No me gusta)
bot.action('pass', async (ctx) => {
    ctx.answerCbQuery('👎 Siguiente...').catch(err => console.log('Botón viejo:', err.message));
    ctx.reply('🔄 Usa /buscar para ver más personas.');
});

// 8. Sistema de LIKES y MATCHES
bot.action(/like_(.+)/, async (ctx) => {
    const targetUserId = ctx.match[1];
    const userId = String(ctx.from.id);

    ctx.answerCbQuery('❤️ Like enviado').catch(err => console.log('Botón viejo:', err.message));

    try {
        // 1. Guardar mi like en Firebase
        const likeId = `${userId}_${targetUserId}`;
        await db.collection('likes').doc(likeId).set({
            from: userId,
            to: targetUserId,
            timestamp: new Date()
        });

        // 2. Verificar si la otra persona ya me dio like (MATCH!)
        const reverseLikeId = `${targetUserId}_${userId}`;
        const reverseLikeDoc = await db.collection('likes').doc(reverseLikeId).get();

        if (reverseLikeDoc.exists) {
            // ¡MATCH! Ambos se dieron like
            const matchId = [userId, targetUserId].sort().join('_');

            await db.collection('matches').doc(matchId).set({
                users: [userId, targetUserId],
                timestamp: new Date()
            });

            // Obtener datos del match para mostrar
            const targetDoc = await db.collection('users').doc(targetUserId).get();
            const targetData = targetDoc.data();

            // Notificar a ambos usuarios
            ctx.reply(`🎉 ¡MATCH!\n\n¡A ${targetData.name} también le gustas!\n\nAhora pueden chatear. Usa /matches para ver tus matches.`);

            // Notificar al otro usuario
            const myDoc = await db.collection('users').doc(userId).get();
            const myData = myDoc.data();

            await bot.telegram.sendMessage(targetUserId,
                `🎉 ¡MATCH!\n\n¡Tienes un nuevo match con ${myData.name}!\n\nUsa /matches para chatear.`
            );
        } else {
            // Like guardado, pero aún no hay match
            ctx.reply('✅ Like enviado. Si esa persona también te da like, te avisaremos del match! 💘');
        }

    } catch (error) {
        console.error('Error en like:', error);
        ctx.reply('❌ Hubo un error. Inténtalo de nuevo.');
    }
});

// 9. Comando /matches - Ver tus matches
bot.command('matches', async (ctx) => {
    const userId = String(ctx.from.id);

    try {
        // Buscar todos los matches donde estoy involucrado
        const matchesSnapshot = await db.collection('matches')
            .where('users', 'array-contains', userId)
            .get();

        if (matchesSnapshot.empty) {
            return ctx.reply('💔 Aún no tienes matches. Usa /buscar para encontrar gente y darles like!');
        }

        let matchList = '💘 TUS MATCHES:\n\n';

        for (const doc of matchesSnapshot.docs) {
            const matchData = doc.data();
            const otherUserId = matchData.users.find(id => id !== userId);
            const otherUserDoc = await db.collection('users').doc(otherUserId).get();
            const otherUserData = otherUserDoc.data();

            matchList += `👤 ${otherUserData.name}\n`;
            matchList += `   /chat_${otherUserId} - Enviar mensaje\n\n`;
        }

        ctx.reply(matchList);

    } catch (error) {
        console.error('Error en matches:', error);
        ctx.reply('❌ Hubo un error al cargar tus matches.');
    }
});

// 10. Iniciar chat con un match
bot.command(/chat_(.+)/, async (ctx) => {
    const targetUserId = ctx.match[1];
    const userId = String(ctx.from.id);

    // Verificar que existe el match
    const matchId = [userId, targetUserId].sort().join('_');
    const matchDoc = await db.collection('matches').doc(matchId).get();

    if (!matchDoc.exists) {
        return ctx.reply('❌ No tienes match con esta persona.');
    }

    // Guardamos a quién le quiere escribir
    await db.collection('users').doc(userId).update({
        chattingWith: targetUserId,
        step: 'sending_message'
    });

    ctx.reply('✍️ Escribe el mensaje que quieres enviarle:');
});

// 11. Manejar texto (Mensajería y Pasos de Registro)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // Ignorar comandos
    if (text.startsWith('/')) return;

    const userDoc = await db.collection('users').doc(String(userId)).get();
    if (!userDoc.exists) return; // Si no está registrado, ignorar

    const userData = userDoc.data();

    // --- LÓGICA DE EDICIÓN ---

    // Editando edad
    if (userData.step === 'editing_age') {
        const age = parseInt(text);
        if (isNaN(age) || age < 18 || age > 99) {
            return ctx.reply('⚠️ Por favor, introduce una edad válida (18-99).');
        }

        await db.collection('users').doc(String(userId)).update({
            age: age,
            step: 'ready'
        });

        return ctx.reply(`✅ Edad actualizada a ${age} años.`);
    }

    // Editando zona
    if (userData.step === 'editing_zone') {
        if (text.length > 30) return ctx.reply('⚠️ Texto muy largo. Intenta ser breve.');

        await db.collection('users').doc(String(userId)).update({
            zone: text,
            step: 'ready'
        });

        return ctx.reply(`✅ Zona actualizada a "${text}".`);
    }

    // Editando bio
    if (userData.step === 'editing_bio') {
        if (text.length > 200) return ctx.reply('⚠️ Bio muy larga (máx 200 caracteres).');

        await db.collection('users').doc(String(userId)).update({
            bio: text,
            step: 'ready'
        });

        return ctx.reply(`✅ Bio actualizada.`);
    }

    // --- LÓGICA DE REGISTRO ---

    // Paso: Edad
    if (userData.step === 'register_age') {
        const age = parseInt(text);
        if (isNaN(age) || age < 18 || age > 99) {
            return ctx.reply('⚠️ Por favor, introduce una edad válida (18-99).');
        }

        await db.collection('users').doc(String(userId)).update({
            age: age,
            step: 'register_zone'
        });

        return ctx.reply('📍 ¿De qué zona eres? (Ej: Las Palmas, Telde, Sur...)');
    }

    // Paso: Zona
    if (userData.step === 'register_zone') {
        if (text.length > 30) return ctx.reply('⚠️ Texto muy largo. Intenta ser breve.');

        await db.collection('users').doc(String(userId)).update({
            zone: text,
            step: 'register_preference' // Volvemos al flujo original pero manual
        });

        // Llamamos a la función que muestra los botones de preferencia
        return askPreference(ctx);
    }

    // Paso: Bio
    if (userData.step === 'register_bio') {
        if (text.length > 200) return ctx.reply('⚠️ Bio muy larga (máx 200 caracteres).');

        await db.collection('users').doc(String(userId)).update({
            bio: text,
            step: 'register_photo'
        });

        return ctx.reply('📸 ¡Último paso! Envíame una foto tuya.',
            Markup.inlineKeyboard([
                [Markup.button.callback('Saltar foto ⏩', 'skip_photo')]
            ])
        );
    }

    // --- LÓGICA DE MENSAJERÍA ---
    if (userData.step === 'sending_message' && userData.chattingWith) {
        const targetId = userData.chattingWith;

        try {
            // Enviar mensaje al destinatario
            await bot.telegram.sendMessage(targetId, `💌 ¡Tienes un nuevo mensaje anónimo!\n\n"${text}"\n\n¿Quieres responder?`,
                Markup.inlineKeyboard([
                    [Markup.button.callback('Responder ↩️', `msg_${userId}`)]
                ])
            );

            ctx.reply('✅ Mensaje enviado correctamente.');

            // Resetear estado
            await db.collection('users').doc(String(userId)).update({
                step: 'ready',
                chattingWith: null
            });

        } catch (error) {
            console.error('Error enviando mensaje:', error);
            ctx.reply('❌ No se pudo enviar el mensaje (el usuario quizás bloqueó el bot).');
        }
    }
});

// 8. Comando /perfil - Ver mis datos
bot.command('perfil', async (ctx) => {
    const userId = ctx.from.id;

    try {
        // 1. LEER: Vamos a Firebase a buscar la ficha de este usuario
        const doc = await db.collection('users').doc(String(userId)).get();

        if (!doc.exists) {
            return ctx.reply('❌ No tienes perfil. Usa /start para registrarte.');
        }

        const data = doc.data();

        // 2. PROCESAR: Convertimos datos crudos en algo bonito
        const genderEmoji = data.gender === 'male' ? 'Chico 👨' : 'Chica 👩';

        let prefEmoji = 'Ambos 🌈';
        if (data.preference === 'male') prefEmoji = 'Chicos 👨';
        if (data.preference === 'female') prefEmoji = 'Chicas 👩';

        const msg = `👤 **TU PERFIL**\n\n` +
            `📛 Nombre: ${data.name}\n` +
            `🎂 Edad: ${data.age || 'N/A'} años\n` +
            `📍 Zona: ${data.zone || 'N/A'}\n` +
            `⚧ Género: ${genderEmoji}\n` +
            `🔍 Buscas: ${prefEmoji}\n` +
            `📝 Bio: ${data.bio || 'Sin bio'}\n` +
            `📊 Estado: ${data.step === 'ready' ? '✅ Activo' : '⚠️ Incompleto'}`;

        // 3. RESPONDER: Enviamos foto (si tiene) y texto
        if (data.photoId) {
            await ctx.replyWithPhoto(data.photoId, { caption: msg, parse_mode: 'Markdown' });
        } else {
            await ctx.reply(msg, { parse_mode: 'Markdown' });
        }

    } catch (error) {
        console.error('Error en perfil:', error);
        ctx.reply('Hubo un error al cargar tu perfil.');
    }
});

// 9. Lanzar el bot
console.log('🤖 Bot iniciado...');
bot.launch();

// Habilitar cierre elegante
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
