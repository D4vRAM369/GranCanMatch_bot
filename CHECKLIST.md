# ✅ CHECKLIST DE DEPLOY

## Antes de subir a GitHub

- [x] `.gitignore` configurado (node_modules, .env, serviceAccountKey.json)
- [x] `package.json` con script "start"
- [x] `README.md` creado
- [x] `firebase.js` soporta variables de entorno
- [ ] Código testeado localmente

## Subir a GitHub

```bash
# 1. Inicializar Git (si no lo has hecho)
git init

# 2. Añadir archivos
git add .

# 3. Commit
git commit -m "Initial commit - Las Palmas MatchBot v1.0"

# 4. Crear repo en GitHub (https://github.com/new)
#    - Nombre: gc-matchbot
#    - Privado: SÍ (para proteger tus claves)
#    - NO inicializar con README

# 5. Conectar y subir
git remote add origin https://github.com/TU_USUARIO/gc-matchbot.git
git branch -M main
git push -u origin main
```

## Deploy en Render

### 1. Preparar Firebase
```bash
# Copiar contenido de serviceAccountKey.json
cat serviceAccountKey.json

# O convertir a base64 (recomendado)
cat serviceAccountKey.json | base64 -w 0
```

### 2. Crear servicio en Render
1. Ir a https://render.com
2. New + → Web Service
3. Conectar GitHub → Seleccionar `gc-matchbot`
4. Configurar:
   - Name: `gc-matchbot`
   - Region: Frankfurt
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

### 3. Variables de entorno
En "Environment Variables":

- `BOT_TOKEN` = (tu token de BotFather)
- `FIREBASE_CONFIG` = (contenido de serviceAccountKey.json)
  O
- `FIREBASE_CONFIG_BASE64` = (base64 del archivo)

### 4. Deploy
- Click "Create Web Service"
- Esperar 2-3 minutos
- ¡Listo!

## Verificar

- [ ] Bot responde en Telegram
- [ ] Logs en Render sin errores
- [ ] Firebase conectado correctamente

## Mantenimiento

### Actualizar código
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Render detectará el cambio y redesplegará automáticamente.

### Ver logs
https://dashboard.render.com → Tu servicio → Logs

### Reiniciar
Dashboard → Manual Deploy → Clear build cache & deploy

## 🎉 ¡Felicidades!

Tu bot ya está en producción 24/7.

Comparte el link: https://t.me/TU_BOT_USERNAME
