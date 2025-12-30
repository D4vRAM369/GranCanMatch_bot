require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN,
    firebaseConfig: process.env.FIREBASE_CONFIG,
    firebaseConfigBase64: process.env.FIREBASE_CONFIG_BASE64,
    collections: {
        users: 'users',
        seen: 'seen',
        matches: 'matches'
    },
    admins: ['D4VRAM369', 'veritasfiliatemporis777'],
    paymentProviderToken: process.env.PAYMENT_PROVIDER_TOKEN || '2051251535:TEST:OTk5MDA4ODgxLTAwNQ'
};
