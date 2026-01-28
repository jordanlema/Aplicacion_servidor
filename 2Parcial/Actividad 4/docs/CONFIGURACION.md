# ⚙️ Guía de Configuración - Credenciales y APIs

Esta guía te ayudará a configurar todas las credenciales necesarias para que los workflows de n8n funcionen correctamente.

## 📋 Credenciales Necesarias

| Servicio | Workflow | Propósito |
|----------|----------|-----------|
| Telegram Bot API | Workflow 1, 3 | Enviar notificaciones |
| Google Sheets API | Workflow 2 | Registrar eventos |
| Gemini API | Workflow 1, 3 | Generar mensajes con IA |
| SMTP (Email) | Workflow 3 | Alertas medias por correo |

## 🤖 1. Configurar Telegram Bot

### Paso 1: Crear Bot con BotFather

1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
2. Envía el comando: `/newbot`
3. Elige un nombre para tu bot (ej: "Sistema Inscripciones")
4. Elige un username (debe terminar en 'bot', ej: "inscripciones_sistema_bot")
5. **Guarda el token** que te proporciona (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Paso 2: Obtener Chat ID

Opción A - Chat privado:
```powershell
# 1. Envía un mensaje a tu bot en Telegram
# 2. Ejecuta este comando (reemplaza TOKEN con tu token)
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

Busca el campo `"chat":{"id": 123456789}` en la respuesta.

Opción B - Grupo:
1. Agrega el bot a tu grupo
2. Envía un mensaje en el grupo
3. Ejecuta el mismo comando curl
4. Busca el chat id del grupo (será negativo, ej: `-987654321`)

### Paso 3: Configurar en n8n

1. En n8n, ve a **Settings** → **Credentials** → **New**
2. Busca "Telegram"
3. Completa:
   - **Name:** `Telegram API`
   - **Access Token:** `tu_token_de_botfather`
4. Guarda

### Paso 4: Configurar Variable de Entorno

Edita el archivo `.env` en `n8n/`:

```env
TELEGRAM_CHAT_ID=tu_chat_id
```

## 📊 2. Configurar Google Sheets API

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google Sheets API**:
   - En el menú, ve a **APIs & Services** → **Library**
   - Busca "Google Sheets API"
   - Click en **Enable**

### Paso 2: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Click en **Create Credentials** → **OAuth client ID**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: **External**
   - App name: "n8n Workflows"
   - User support email: tu email
   - Scopes: Agregar `.../auth/spreadsheets`
   - Test users: Agrega tu email
4. Tipo de aplicación: **Web application**
5. Authorized redirect URIs:
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
6. **Guarda Client ID y Client Secret**

### Paso 3: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: "Registro de Eventos - n8n"
4. Crea una pestaña llamada: `Eventos`
5. Agrega los encabezados en la primera fila:

| Fecha | Tipo de Evento | Curso | Estudiante | Estado | Curso ID | Inscripción ID | Email | Criticidad | Origen |
|-------|---------------|-------|------------|--------|----------|---------------|-------|-----------|--------|

6. **Copia el ID de la hoja** (está en la URL):
   ```
   https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit
   ```

### Paso 4: Configurar en n8n

1. En n8n, ve a **Settings** → **Credentials** → **New**
2. Busca "Google Sheets OAuth2 API"
3. Completa:
   - **Name:** `Google Sheets OAuth2`
   - **Client ID:** `tu_client_id`
   - **Client Secret:** `tu_client_secret`
4. Click en **Connect my account**
5. Autoriza el acceso en Google
6. Guarda

### Paso 5: Configurar Variable de Entorno

```env
GOOGLE_SHEETS_ID=tu_spreadsheet_id
```

## 🤖 3. Configurar Gemini API

### Paso 1: Obtener API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Click en **Get API Key** o **Create API Key**
4. Selecciona un proyecto de Google Cloud (o crea uno nuevo)
5. **Copia la API Key**

### Paso 2: Configurar en n8n

1. En n8n, ve a **Settings** → **Credentials** → **New**
2. Busca "Google Gemini API"
3. Completa:
   - **Name:** `Gemini API`
   - **API Key:** `tu_api_key_de_gemini`
4. Guarda

## 📧 4. Configurar Email (SMTP)

### Opción A: Gmail (Recomendado para Desarrollo)

#### Paso 1: Habilitar "Contraseñas de Aplicación"

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad**
3. Habilita **Verificación en 2 pasos** (si no está habilitada)
4. Busca **Contraseñas de aplicaciones**
5. Genera una contraseña para "Correo" y "Windows Computer"
6. **Guarda la contraseña** (16 caracteres)

#### Paso 2: Configurar en n8n

1. En n8n, ve a **Settings** → **Credentials** → **New**
2. Busca "SMTP"
3. Completa:
   - **Name:** `SMTP Account`
   - **User:** `tu_email@gmail.com`
   - **Password:** `tu_contraseña_de_aplicacion`
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **Security:** `TLS`
4. Guarda

### Opción B: Outlook/Hotmail

```
Host: smtp-mail.outlook.com
Port: 587
Security: STARTTLS
User: tu_email@outlook.com
Password: tu_contraseña
```

### Opción C: Servicio SMTP Personalizado

Configura según tu proveedor de email.

### Paso 3: Configurar Variables de Entorno

```env
EMAIL_FROM=tu_email@gmail.com
EMAIL_ADMIN=email_administrador@ejemplo.com
```

## 🔐 Archivo .env Completo

Crea/edita el archivo `Actividad 4/n8n/.env`:

```env
# ===============================
# n8n Configuration
# ===============================
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
N8N_HOST=localhost
N8N_PORT=5678

# ===============================
# Telegram Configuration
# ===============================
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# ===============================
# Google Sheets Configuration
# ===============================
GOOGLE_SHEETS_ID=1abcDEF2ghiJKL3mnoPQR4stuVWX5yzAB6cdefGHI

# ===============================
# Email Configuration
# ===============================
EMAIL_FROM=tu_email@gmail.com
EMAIL_ADMIN=admin@ejemplo.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# ===============================
# Timezone
# ===============================
GENERIC_TIMEZONE=America/Bogota
TZ=America/Bogota
```

## 🧪 Verificar Configuración

### Test 1: Telegram Bot

```powershell
# Enviar mensaje de prueba (reemplaza TOKEN y CHAT_ID)
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" `
  -H "Content-Type: application/json" `
  -d "{\"chat_id\": \"<CHAT_ID>\", \"text\": \"✅ Test desde PowerShell\"}"
```

### Test 2: Google Sheets

1. Ve a tu hoja de cálculo
2. Agrega manualmente una fila de prueba
3. Verifica que puedas editar sin problemas

### Test 3: Gemini API

```powershell
# Test de API (reemplaza API_KEY)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=<API_KEY>" `
  -H "Content-Type: application/json" `
  -d "{\"contents\":[{\"parts\":[{\"text\":\"Di hola\"}]}]}"
```

### Test 4: SMTP

Usa el nodo de Email en n8n con el modo "Test" para verificar.

## 🔄 Reiniciar n8n

Después de configurar las credenciales:

```powershell
cd "Actividad 4/n8n"
docker-compose restart
```

## 🛡️ Seguridad

### Buenas Prácticas

1. **NUNCA** commitees el archivo `.env` a Git
2. Agrega `.env` al `.gitignore`:
   ```gitignore
   .env
   *.env.local
   ```
3. Usa credenciales diferentes para desarrollo y producción
4. Rota las API keys periódicamente
5. Limita los permisos de las cuentas de servicio

### .gitignore Recomendado

```gitignore
# Archivos de entorno
.env
.env.local
.env.*.local

# Credenciales
credentials.json
token.json

# Logs
*.log

# Backups
backup-*.json
```

## 📱 Obtener IDs Útiles

### Chat ID de Telegram (alternativa)

Bot: [@userinfobot](https://t.me/userinfobot)
- Envía `/start`
- Te responderá con tu User ID

### Google Sheet ID

Está en la URL:
```
https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
```

## ❓ Troubleshooting

### Error: Telegram "Unauthorized"

**Causa:** Token incorrecto o bot bloqueado

**Solución:**
1. Verifica que el token sea correcto
2. Asegúrate de haber enviado `/start` al bot
3. Verifica que no hayas bloqueado el bot

### Error: Google Sheets "Insufficient Permission"

**Causa:** Falta scope en OAuth o cuenta sin permisos

**Solución:**
1. Vuelve a autorizar en n8n
2. Verifica que la cuenta tenga acceso a la hoja
3. Comparte la hoja con la cuenta de servicio

### Error: Gemini "API Key Invalid"

**Causa:** API Key incorrecta o expirada

**Solución:**
1. Genera una nueva API Key
2. Verifica que hayas copiado toda la key
3. Comprueba que el proyecto tenga Gemini API habilitada

### Error: SMTP "Authentication Failed"

**Causa:** Contraseña incorrecta o 2FA no configurado

**Solución:**
1. Usa una "Contraseña de Aplicación" (no tu contraseña normal)
2. Verifica que 2FA esté habilitado en Gmail
3. Genera una nueva contraseña de aplicación

## 📚 Recursos

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Gemini API Docs](https://ai.google.dev/docs)
- [n8n Credentials Guide](https://docs.n8n.io/credentials/)
