# 💘 Las Palmas MatchBot

Bot de Telegram para encontrar pareja/amistades en Gran Canaria, fuera de las apps comerciales tipo Tinder.

## 🌟 Características

- ✅ Registro completo con perfil (edad, zona/ciudad, bio, foto)
- ❤️ Sistema de likes tipo Tinder
- 🎉 Matches mutuos
- 💬 Chat solo con matches
- 🔒 Privacidad: tus likes son secretos hasta que haya match
- 🔥 Base de datos persistente con Firebase
- 📍 Filtro por distancia si compartes ubicación y eliges radio

## 📋 Comandos

- `/start` - Registrarte o reiniciar perfil
- `/buscar` - Ver personas y darles like
- `/matches` - Ver tus matches y chatear
- `/perfil` - Ver tu perfil
- `/foto` - Cambiar tu foto
- `/ayuda` - Menú de ayuda
- `/ubicacion` - Configurar ubicación precisa/aproximada, radio o desactivar

Flujo de registro: género → preferencia → edad → bio → ubicación opcional (compartir GPS o escribir ciudad) → radio de búsqueda.
Si compartes ubicación podrás filtrar por distancia; si la omites, se filtra solo por preferencia.

## 🚀 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/gc-matchbot.git
cd gc-matchbot

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu BOT_TOKEN

# Añadir serviceAccountKey.json de Firebase en la raíz

# Ejecutar
npm start
```

## 🌐 Deploy en Render

1. Sube el código a GitHub
2. Ve a [Render.com](https://render.com) y crea una cuenta
3. Crea un nuevo "Web Service"
4. Conecta tu repositorio de GitHub
5. Configura las variables de entorno (BOT_TOKEN)
6. Sube `serviceAccountKey.json` como archivo secreto
7. ¡Deploy!

## 👨‍💻 Desarrollado por

[D4vRAM](https://github.com/D4vRAM369)

## 📄 Licencia

ISC
