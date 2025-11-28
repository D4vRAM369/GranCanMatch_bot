# 🚀 Guía de Deploy a Render

## Paso 1: Preparar Git y GitHub

### 1.1 Inicializar Git (si no lo has hecho)
```bash
cd /home/defcon/gc-matchbot
git init
git add .
git commit -m "Initial commit - Las Palmas MatchBot"
```

### 1.2 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `gc-matchbot` (o el que prefieras)
3. Descripción: "Bot de matchmaking para Gran Canaria"
4. **IMPORTANTE**: Márcalo como **PRIVADO** (para proteger tus claves)
5. NO inicialices con README (ya lo tienes)
6. Crea el repositorio

### 1.3 Subir código a GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/gc-matchbot.git
git branch -M main
git push -u origin main
```

---

## Paso 2: Preparar Firebase para producción

### 2.1 Convertir serviceAccountKey.json a variable de entorno
Tu archivo `serviceAccountKey.json` no debe subirse a GitHub (ya está en .gitignore).

En Render, lo configuraremos como variable de entorno.

**Opción A: Copiar el contenido**
```bash
cat serviceAccountKey.json
```
Copia TODO el contenido (es un JSON largo).

**Opción B: Convertir a base64 (más limpio)**
```bash
cat serviceAccountKey.json | base64 -w 0
```
Copia el resultado.

---

## Paso 3: Deploy en Render

### 3.1 Crear cuenta en Render
1. Ve a https://render.com
2. Crea cuenta (puedes usar GitHub para login)
3. Verifica tu email

### 3.2 Crear nuevo servicio
1. Click en "New +" → "Web Service"
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `gc-matchbot`
4. Click "Connect"

### 3.3 Configurar el servicio
- **Name**: `gc-matchbot` (o el que prefieras)
- **Region**: Frankfurt (más cerca de España)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 3.4 Variables de entorno
Click en "Advanced" → "Add Environment Variable"

Añade estas variables:

1. **BOT_TOKEN**
   - Value: `tu_token_de_botfather`

2. **FIREBASE_CONFIG** (si usaste opción A)
   - Value: Pega el contenido completo de serviceAccountKey.json

   O **FIREBASE_CONFIG_BASE64** (si usaste opción B)
   - Value: Pega el string base64

### 3.5 Deploy
1. Click en "Create Web Service"
2. Render empezará a construir tu app
3. Espera 2-3 minutos
4. ¡Listo! Tu bot estará funcionando 24/7

---

## Paso 4: Modificar código para leer Firebase de variable de entorno

Si usaste variable de entorno para Firebase, necesitas modificar `src/firebase.js`:

```javascript
const admin = require('firebase-admin');

let serviceAccount;

// Intentar leer de variable de entorno primero (producción)
if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else if (process.env.FIREBASE_CONFIG_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decoded);
} else {
    // Leer de archivo local (desarrollo)
    try {
        serviceAccount = require('../serviceAccountKey.json');
    } catch (error) {
        console.error('❌ Error: No se encontró configuración de Firebase.');
        process.exit(1);
    }
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('🔥 Firebase conectado correctamente');

module.exports = db;
```

---

## Paso 5: Verificar que funciona

1. Abre Telegram
2. Busca tu bot
3. Escribe `/start`
4. ¡Debería responder!

---

## 🔧 Troubleshooting

### El bot no responde
- Revisa los logs en Render (pestaña "Logs")
- Verifica que BOT_TOKEN esté bien configurado
- Verifica que Firebase esté conectado

### Error de Firebase
- Asegúrate de que FIREBASE_CONFIG esté bien copiado (JSON válido)
- Verifica que no haya espacios extra al inicio/final

### El servicio se duerme
- En el plan gratuito, Render duerme el servicio después de 15 min de inactividad
- Se despierta automáticamente cuando alguien usa el bot
- Para mantenerlo siempre activo, necesitas el plan de pago ($7/mes)

---

## 📊 Monitoreo

- **Logs en tiempo real**: Pestaña "Logs" en Render
- **Reiniciar**: Botón "Manual Deploy" → "Clear build cache & deploy"
- **Variables**: Pestaña "Environment" para editar BOT_TOKEN, etc.

---

## 🎉 ¡Listo!

Tu bot ya está en la nube funcionando 24/7. Ahora puedes:
- Compartir el bot con tus amigos
- Apagar tu PC sin problemas
- Ver estadísticas en Firebase Console

¿Dudas? Revisa los logs o contacta al desarrollador.
