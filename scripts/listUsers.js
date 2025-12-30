const { getAllUsers } = require('../src/firebase/users');

// Cargar variables de entorno si es necesario (el admin.js ya lo intenta manejar)
require('dotenv').config({ path: '../.env' });

async function main() {
    try {
        console.log('🔄 Conectando a Firestore y obteniendo usuarios...');
        const users = await getAllUsers();

        console.log(`\n✅ Encontrados ${users.length} usuarios registrados:\n`);

        if (users.length === 0) {
            console.log("⚠️ No hay usuarios registrados.");
        } else {
            console.log("ID \t\t| Nombre \t\t| Username");
            console.log("-".repeat(60));
            users.forEach((user, index) => {
                const name = (user.name || user.first_name || '').trim();
                const username = user.username ? `@${user.username}` : 'Sin username';
                const id = user.id || 'Sin ID';
                console.log(`${id} \t| ${name.padEnd(20).slice(0, 20)} \t| ${username}`);
            });
        }
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
    } finally {
        process.exit(0);
    }
}

main();
