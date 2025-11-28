const admin = require('firebase-admin');

let serviceAccount;

// Intentar leer de variable de entorno primero (producción en Render)
if (process.env.FIREBASE_CONFIG) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
        console.log('🔥 Usando Firebase desde variable de entorno FIREBASE_CONFIG');
    } catch (error) {
        console.error('❌ Error parseando FIREBASE_CONFIG:', error.message);
        process.exit(1);
    }
} else if (process.env.FIREBASE_CONFIG_BASE64) {
    try {
        const decoded = Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
        console.log('🔥 Usando Firebase desde variable de entorno FIREBASE_CONFIG_BASE64');
    } catch (error) {
        console.error('❌ Error parseando FIREBASE_CONFIG_BASE64:', error.message);
        process.exit(1);
    }
} else {
    // Leer de archivo local (desarrollo)
    try {
        serviceAccount = require('../serviceAccountKey.json');
        console.log('🔥 Usando Firebase desde archivo local serviceAccountKey.json');
    } catch (error) {
        console.error('❌ Error: No se encontró el archivo serviceAccountKey.json en la raíz del proyecto.');
        console.error('👉 Ve a la consola de Firebase > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada.');
        console.error('👉 O configura la variable de entorno FIREBASE_CONFIG en producción.');
        process.exit(1);
    }
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('🔥 Firebase conectado correctamente');

module.exports = db;
