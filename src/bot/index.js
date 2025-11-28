const { Telegraf } = require('telegraf');
const config = require('../config');
const commands = require('./commands');
const handlers = require('./handlers');

const bot = new Telegraf(config.botToken);

// Middleware
bot.use(async (ctx, next) => {
    if (!ctx.from) return next();
    // Aquí podríamos añadir logging o validaciones globales
    return next();
});

// Comandos
bot.start(commands.start);
bot.command('perfil', commands.perfil);
bot.command('buscar', commands.buscar);
bot.command('ayuda', commands.ayuda);
bot.command('foto', commands.foto);
bot.command('matches', commands.matches);
bot.command('ubicacion', commands.ubicacion);
bot.command('borrar', commands.borrar);

// Acciones (Botones)
bot.action(['gender_male', 'gender_female'], handlers.handleGender);
bot.action(/pref_(.+)/, handlers.handlePreference);
bot.action(/^(like|pass)_(.+)$/, handlers.handleLikeDislike);
bot.action(['start_search', 'start_edit'], handlers.handleStartOptions);
bot.action(['loc_precise', 'loc_city', 'loc_off', 'loc_count'], handlers.handleLocationActions);
bot.action(['delete_yes', 'delete_no'], handlers.handleDeleteActions);
bot.action(/radius_(\d+)/, handlers.handleRadius);

// Eventos
bot.on('photo', handlers.handlePhoto);
bot.on('location', handlers.handleLocation);
bot.on('text', handlers.handleText);

// Manejo de errores
bot.catch((err, ctx) => {
    console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot;
