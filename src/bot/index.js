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

// Configurar menú de comandos (oculta /users y /admin)
bot.telegram.setMyCommands([
    { command: 'start', description: 'Iniciar o reiniciar el bot' },
    { command: 'buscar', description: 'Buscar personas cercanas' },
    { command: 'perfil', description: 'Ver mi perfil' },
    { command: 'matches', description: 'Ver mis matches' },
    { command: 'foto', description: 'Cambiar foto de perfil' },
    { command: 'ubicacion', description: 'Configurar ubicación y radio' },
    { command: 'link', description: 'Vincular con App Spots' },
    { command: 'ayuda', description: 'Ayuda y soporte' },
    { command: 'borrar', description: 'Borrar mi cuenta' },
    { command: 'admin', description: 'Enviar mensaje al administrador (SOLO PARA REPORTES)' }
]);

// Comandos
bot.start(commands.start);
bot.command('perfil', commands.perfil);
bot.command('buscar', commands.buscar);
bot.command('ayuda', commands.ayuda);
bot.command('foto', commands.foto);
bot.command('matches', commands.matches);
bot.command('ubicacion', commands.ubicacion);
bot.command('borrar', commands.borrar);
bot.command('link', commands.link);
bot.command('users', commands.users);
bot.command('admin', commands.admin);
bot.command('promo', commands.promo);
bot.command('message', commands.message);

// Acciones (Botones)
bot.action(['gender_male', 'gender_female'], handlers.handleGender);
bot.action(/pref_(.+)/, handlers.handlePreference);
bot.action(/^(like|pass)_(.+)$/, handlers.handleLikeDislike);
bot.action(['start_search', 'start_edit'], handlers.handleStartOptions);
bot.action(['loc_precise', 'loc_city', 'loc_off', 'loc_count'], handlers.handleLocationActions);
bot.action(['delete_yes', 'delete_no'], handlers.handleDeleteActions);
bot.action(/radius_(\d+)/, handlers.handleRadius);
bot.action('admin_contact', handlers.handleAdmin);

// Eventos
bot.on('photo', handlers.handlePhoto);
bot.on('location', handlers.handleLocation);
bot.on('text', handlers.handleText);

// Manejo de errores
bot.catch((err, ctx) => {
    console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot;
