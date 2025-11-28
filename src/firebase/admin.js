const admin = require('firebase-admin');
const config = require('../config');

let serviceAccount;

// Lógica de inicialización (idéntica a la que teníamos)
if (config.firebaseConfig) {
    try {
        serviceAccount = JSON.parse(config.firebaseConfig);
    } catch (error) {
        console.error('❌ Error parseando FIREBASE_CONFIG:', error.message);
        process.exit(1);
    }
} else if (config.firebaseConfigBase64) {
    try {
        const decoded = Buffer.from(config.firebaseConfigBase64, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
    } catch (error) {
        console.error('❌ Error parseando FIREBASE_CONFIG_BASE64:', error.message);
        process.exit(1);
    }
} else {
    try {
        serviceAccount = require('../../serviceAccountKey.json');
    } catch (error) {
        console.error('❌ Error: No se encontró serviceAccountKey.json ni variables de entorno.');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
console.log('🔥 Firebase Admin inicializado');

module.exports = db;
