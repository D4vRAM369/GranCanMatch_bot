const welcomeMessage = (name) => `¡Hola ${name}! 👋 Bienvenido a GranCanMatch_bot 🌴.

Un lugar donde conocer gente de forma sencilla y directa en Las Palmas 🇮🇨, fuera de las redes convencionales tipo Tinder y derivados, que monetizan y mercantilizan los vínculos emocionales, sin ofrecer conexión real y directa a cambio.

En éste bot, el objetivo no es hacer dinero, sino conectar con personas de Gran Canaria que echen de menos una conexión auténtica, lejos de la tiranía de los algoritmos con suscripciones abusivas.

Desarrollado por D4vRAM. Tienes el proyecto y el código fuente del repositorio publicado en: https://github.com/D4vRAM369/GranCanMatch_bot 😉💫

Para empezar, cuéntame un poco sobre ti.
¿Eres chico o chica?`;

const helpMessage = `📚 *Ayuda del MatchBot*

/start - Crear o reiniciar perfil
/buscar - Encontrar gente nueva
/perfil - Ver tus datos
/matches - Ver tus matches
/ayuda - Ver este mensaje
/foto - Cambiar tu foto
/ubicacion - Gestionar ubicación (precisa/aproximada/off) y radio
/borrar - Eliminar tu perfil y datos

📅 Registro: género → preferencia → edad → bio → ubicación (opcional) → radio de búsqueda.
📍 Si compartes ubicación, filtramos por distancia.
📸 ¡Envía una foto al chat para establecerla como tu foto de perfil!`;

const noCandidatesMessage = '😢 No hay más personas nuevas por ahora.\n- Prueba a ampliar tu radio.\n- O vuelve más tarde e invita a tus amigos.';

const matchMessageSelf = (targetName, targetUsername, targetId) => {
    const link = targetUsername && targetUsername !== 'Anónimo'
        ? `https://t.me/${targetUsername}`
        : `tg://user?id=${targetId}`;

    return `🔥 ¡ES UN MATCH! 🔥

Le gustas a <b>${targetName}</b> también.

<a href="${link}">Escríbele 💬</a>`;
};

const matchMessageTarget = (userName, userUsername, userId) => {
    const link = userUsername && userUsername !== 'Anónimo'
        ? `https://t.me/${userUsername}`
        : `tg://user?id=${userId}`;

    return `🔥 ¡ES UN MATCH! 🔥

Le gustas a <b>${userName}</b>.

<a href="${link}">Escríbele 💬</a>`;
};

module.exports = {
    welcomeMessage,
    helpMessage,
    noCandidatesMessage,
    matchMessageSelf,
    matchMessageTarget
};
