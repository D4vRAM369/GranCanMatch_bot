# 🌴 GranCanMatch Bot

> **"Conexiones reales, sin algoritmos depredadores."**

Un bot de Telegram para conocer gente en **Gran Canaria** de forma sencilla, directa y honesta.

Vivimos en una era donde las apps de citas monetizan nuestra soledad y gamifican las relaciones humanas. **GranCanMatch** nace como una alternativa local y ética:
- 🚫 **Sin algoritmos oscuros**: Ves a la gente por orden de llegada o distancia, no porque paguen más.
- 🚫 **Sin micropagos abusivos**: Todas las funciones son gratuitas.
- 🤝 **Conexión directa**: Si hay match, hablas directamente en Telegram. Sin intermediarios.

## 🌟 Características

- ✅ **Perfil Completo**: Edad, Bio, Foto y Ubicación (opcional).
- 📍 **Geolocalización Ética**: Filtra por distancia (km) solo si tú también compartes tu ubicación.
- ❤️ **Matches**: Sistema de Likes/Pass. Si es recíproco, ¡se abre el chat!
- 📸 **Fotos**: Sube tu foto directamente al chat.
- 🔒 **Privacidad**: Tus likes son secretos hasta que haya match.

## 📋 Comandos

- `/start` - Crear o reiniciar perfil
- `/buscar` - Ver personas y darles like
- `/matches` - Ver tus matches y chatear
- `/perfil` - Ver tu perfil
- `/foto` - Cambiar tu foto
- `/ubicacion` - Configurar filtros de distancia
- `/ayuda` - Menú de ayuda
- `/borrar` - Eliminar tu perfil y datos

## 🚀 Instalación Local

1. **Clonar y preparar**:
   ```bash
   git clone https://github.com/TU_USUARIO/gc-matchbot.git
   cd gc-matchbot
   npm install
   ```

2. **Configuración**:
   - Copia `.env.example` a `.env` y pon tu `BOT_TOKEN`.
   - Coloca tu archivo `serviceAccountKey.json` de Firebase en la raíz.

3. **Ejecutar**:
   ```bash
   npm start
   ```

## ☁️ Despliegue en DigitalOcean (Droplet)

Si tienes un VPS (Droplet), sigue estos pasos para mantener el bot activo 24/7:

1. **Entra a tu servidor**:
   ```bash
   ssh root@tu_ip
   ```

2. **Instala Node.js y Git** (si no los tienes):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```

3. **Clona el repo y configura**:
   ```bash
   git clone https://github.com/TU_USUARIO/gc-matchbot.git
   cd gc-matchbot
   npm install
   # Sube tu .env y serviceAccountKey.json (puedes usar scp o nano)
   ```

4. **Usa PM2 para mantenerlo vivo**:
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name "gc-matchbot"
   pm2 save
   pm2 startup
   ```

## 👨‍💻 Desarrollado por

[D4vRAM](https://github.com/D4vRAM369) - *Code with soul.*

## 📄 Licencia

GPLv3

## 🔒 Privacidad

Consulta `PRIVACY.md` para conocer qué datos se recogen, cómo se usan y cómo borrarlos.
