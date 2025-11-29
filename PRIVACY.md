# Política de Privacidad - GranCanMatch Bot

Última actualización: 2025-11-29

## Quién opera el bot
GranCanMatch_bot es operado por el propietario del bot en Telegram. Contacto: https://github.com/D4vRAM369 (Issues o contacto en el perfil).

## Datos que se recogen
- Identificadores de Telegram: ID de usuario, username, nombre visible.
- Datos de perfil: género, preferencia, edad, bio, foto (file_id de Telegram).
- Ubicación opcional: coordenadas de GPS (lat/lon) y/o texto de ciudad/zona; radio de búsqueda.
- Interacciones: likes/pass enviados, matches, último activo.
- Logs técnicos mínimos: errores y eventos de arranque (sin almacenar contenido de chats).

## Para qué se usan
- Ejecutar el servicio de matchmaking: registrar perfiles, filtrar y mostrar candidatos, gestionar likes/matches.
- Filtrar por distancia solo si compartes ubicación y radio.
- Mejorar la experiencia (evitar repetidos y abusos básicos).

## Dónde se guardan
- Base de datos: Google Firestore (Firebase), alojado por Google.
- Telegram almacena los mensajes/fotos según sus propias políticas.

## Retención
- Se conservan mientras uses el bot. Puedes borrar tu perfil y datos con el comando `/borrar`.
- Likes y “visto” se borran con tu perfil.

## Con quién se comparten
- No se venden ni se comparten con terceros.
- Proveedores necesarios: Telegram (plataforma de mensajería) y Google Firebase (base de datos).

## Tus controles
- Perfil: usa `/start` para crear/editar; `/perfil` para ver.
- Ubicación: gestiona con `/ubicacion` (precisa, aproximada, desactivar).
- Borrado: `/borrar` elimina tu perfil y datos en Firestore.

## Seguridad
- Las credenciales del bot y Firebase se manejan como secretos; no se publican en el repositorio.
- No se almacenan contenidos de chat más allá de los campos anteriores.

## Cambios en esta política
- Si hay cambios relevantes, se actualizará este documento con nueva fecha.

## Licencia y repositorio
- Código bajo GPLv3. El repositorio en GitHub no incluye tus datos ni claves privadas; solo el código del bot.
