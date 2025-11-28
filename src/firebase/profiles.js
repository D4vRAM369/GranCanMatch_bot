const usersDB = require('./users');

// Por ahora, el perfil es lo mismo que el usuario.
// En el futuro, aquí podríamos poner lógica para fotos, bio detallada, etc.

async function getProfile(userId) {
    return await usersDB.getUser(userId);
}

module.exports = {
    getProfile
};
