# 📋 Configuración del Workflow n8n: exam2p-audit-workflow

## 🔧 Pasos para Configurar

### 1. Importar el Workflow

1. Abrir n8n (http://localhost:5678)
2. Click en **"+ Add Workflow"**
3. Click en los **3 puntos** (menú) → **"Import from File"**
4. Seleccionar el archivo `exam2p-audit-workflow.json`

---

### 2. Configurar Credenciales

#### A) Credencial de Gemini API

1. En n8n, ir a **Settings** → **Credentials**
2. Click en **"+ Add Credential"**
3. Buscar **"HTTP Query Auth"**
4. Configurar:
   - **Name**: `Gemini API Key`
   - **Parameter Name**: `key`
   - **Value**: Tu API Key de Gemini (obtener en https://makersuite.google.com/app/apikey)
5. Guardar

#### B) Credencial de Telegram Bot

1. Crear un bot en Telegram:
   - Abrir Telegram y buscar `@BotFather`
   - Enviar `/newbot`
   - Seguir las instrucciones
   - Copiar el **Token del Bot**

2. Obtener tu Chat ID:
   - Buscar `@userinfobot` en Telegram
   - Enviar cualquier mensaje
   - Copiar tu **Chat ID**

3. En n8n:
   - Ir a **Settings** → **Credentials**
   - Click en **"+ Add Credential"**
   - Buscar **"Telegram API"**
   - Configurar:
     - **Name**: `Telegram Bot`
     - **Access Token**: El token del bot
   - Guardar

4. En el nodo **Telegram** del workflow:
   - Hacer doble click
   - Cambiar `YOUR_TELEGRAM_CHAT_ID` por tu Chat ID real

---

### 3. Activar el Workflow

1. En la esquina superior derecha, cambiar el switch a **"Active"**
2. El webhook estará disponible en:
   ```
   http://localhost:5678/webhook/exam2p-audit-deletion
   ```

---

## 🔁 Flujo del Workflow

```
Webhook (recibe exam2p.audit.deletion)
    │
    ▼
IF (valida que sea evento DELETE)
    │
    ├── TRUE ──► HTTP Request (Gemini genera mensaje)
    │                │
    │                ▼
    │           Telegram (envía alerta)
    │                │
    │                ▼
    │           Respond to Webhook (OK)
    │
    └── FALSE ─► Respond False (evento ignorado)
```

---

## 📤 Payload Esperado

El webhook espera recibir este formato exacto:

```json
{
  "event": "exam2p.audit.deletion",
  "timestamp": "2026-01-27T10:30:00.000Z",
  "data": {
    "exam2p_entity": "Usuario",
    "exam2p_recordId": 12345,
    "exam2p_user": "admin@test.com",
    "exam2p_detail": "Usuario eliminado del sistema"
  }
}
```

---

## 🧪 Probar el Workflow

### Opción 1: Usando curl

```bash
curl -X POST http://localhost:5678/webhook/exam2p-audit-deletion \
  -H "Content-Type: application/json" \
  -d '{
    "event": "exam2p.audit.deletion",
    "timestamp": "2026-01-27T10:30:00.000Z",
    "data": {
      "exam2p_entity": "Producto",
      "exam2p_recordId": 999,
      "exam2p_user": "test@example.com",
      "exam2p_detail": "Producto eliminado - prueba de examen"
    }
  }'
```

### Opción 2: Usando el endpoint de prueba del microservicio

```bash
curl -X POST http://localhost:3000/exam2p-audit/test \
  -H "Content-Type: application/json" \
  -d '{
    "exam2p_entity": "Cliente",
    "exam2p_recordId": 555,
    "exam2p_action": "DELETE",
    "exam2p_user": "admin@empresa.com",
    "exam2p_detail": "Cliente dado de baja"
  }'
```

---

## ✅ Verificación

1. **En n8n**: Ver la ejecución en el historial del workflow
2. **En Telegram**: Recibir el mensaje de alerta
3. **En el microservicio**: Ver los logs en consola
