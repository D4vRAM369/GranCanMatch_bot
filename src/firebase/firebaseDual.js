const admin = require('firebase-admin');

// 1. REUTILIZAMOS la conexión del Bot que ya existe y funciona (admin.js)
// Esto mantiene el soporte para variables de entorno y evita duplicar conexiones.
const botDb = require('./admin');

// 2. INICIALIZAMOS la conexión nueva para SPOTS
let spotsDb;

try {
    // Buscamos la clave específica para Spots
    const spotsServiceAccount = require('./serviceAccountKey-spots.json');

    const spotsApp = admin.initializeApp(
        {
            credential: admin.credential.cert(spotsServiceAccount)
        },
        'spotsApp' // Nombre obligatorio para la segunda instancia
    );

    spotsDb = spotsApp.firestore();
    console.log('✅ Conexión exitosa con Spots DB (spots-b0070)');

} catch (error) {
    console.error('⚠️ AVISO: No se pudo conectar con Spots DB.');
    console.error('   Asegúrate de tener src/firebase/serviceAccountKey-spots.json');
    console.error('   Detalle:', error.message);

    spotsDb = null;
}

module.exports = {
    botDb,   // La de siempre (gc-matchbot)
    spotsDb  // La nueva (spots-b0070)
};
