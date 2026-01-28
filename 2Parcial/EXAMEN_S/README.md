# 🏗️ EXAMEN 2P AUDIT - Solución Completa

## 📋 Descripción

Sistema de auditoría distribuido que incluye:

1. **Microservicio** (`exam2p-audit-service`) - Node.js + Express + SQLite
2. **Consumidor RabbitMQ** - Cola `exam2p.record.deleted`
3. **Emisor de Webhooks** - Evento `exam2p.audit.deletion`
4. **API REST** - Endpoint `GET /exam2p-audit`
5. **MCP Tool** - `exam2p_query_audit`
6. **Workflow n8n** - `exam2p-audit-workflow`

---

## 🗂️ Estructura del Proyecto

```
EXAMEN_S/
├── exam2p-audit-service/          # Microservicio principal
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js        # Configuración SQLite
│   │   ├── models/
│   │   │   └── Exam2PAuditLog.js  # Modelo de auditoría
│   │   ├── rabbit/
│   │   │   └── consumer.js        # Consumidor RabbitMQ
│   │   ├── routes/
│   │   │   └── audit.routes.js    # Rutas REST
│   │   ├── webhook/
│   │   │   └── webhookEmitter.js  # Emisor de webhooks
│   │   ├── test/
│   │   │   └── testPublisher.js   # Script de prueba
│   │   └── app.js                 # Punto de entrada
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── exam2p-mcp-tool/               # Herramienta MCP
│   ├── src/
│   │   └── index.js               # Tool exam2p_query_audit
│   ├── mcp-config.json            # Configuración MCP
│   └── package.json
│
├── n8n-workflow/                  # Workflow n8n
│   ├── exam2p-audit-workflow.json # Workflow exportado
│   └── README-CONFIGURACION-N8N.md
│
└── README.md                      # Este archivo
```

---

## 🚀 Instalación y Ejecución

### Paso 1: Iniciar RabbitMQ (Docker)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Acceder a RabbitMQ Management: http://localhost:15672 (guest/guest)

### Paso 2: Iniciar el Microservicio

```bash
cd exam2p-audit-service
npm install
npm start
```

El servicio estará en: http://localhost:3000

### Paso 3: Iniciar n8n (Docker)

```bash
docker run -d --name n8n -p 5678:5678 n8nio/n8n
```

Acceder a n8n: http://localhost:5678

### Paso 4: Importar Workflow en n8n

1. Abrir n8n
2. Importar el archivo `n8n-workflow/exam2p-audit-workflow.json`
3. Configurar credenciales (ver README dentro de la carpeta)
4. Activar el workflow

### Paso 5: Configurar MCP Tool (opcional)

```bash
cd exam2p-mcp-tool
npm install
```

Agregar a tu configuración de Claude/MCP el contenido de `mcp-config.json`

---

## 🧪 Pruebas

### Probar el Endpoint REST

```bash
# Obtener todos los registros
curl http://localhost:3000/exam2p-audit

# Obtener con límite
curl http://localhost:3000/exam2p-audit?limit=5
```

### Probar creación manual (sin RabbitMQ)

```bash
curl -X POST http://localhost:3000/exam2p-audit/test \
  -H "Content-Type: application/json" \
  -d '{
    "exam2p_entity": "Usuario",
    "exam2p_recordId": 123,
    "exam2p_action": "DELETE",
    "exam2p_user": "admin@test.com",
    "exam2p_detail": "Usuario eliminado - prueba"
  }'
```

### Probar con RabbitMQ

```bash
cd exam2p-audit-service
npm run test:rabbit
```

### Probar webhook directamente

```bash
curl -X POST http://localhost:5678/webhook/exam2p-audit-deletion \
  -H "Content-Type: application/json" \
  -d '{
    "event": "exam2p.audit.deletion",
    "timestamp": "2026-01-27T10:00:00.000Z",
    "data": {
      "exam2p_entity": "Producto",
      "exam2p_recordId": 999,
      "exam2p_user": "test@test.com",
      "exam2p_detail": "Producto eliminado"
    }
  }'
```

---

## 📦 Entidad: Exam2PAuditLog

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | PK autoincrement |
| exam2p_entity | string | Entidad afectada |
| exam2p_recordId | number | ID del registro |
| exam2p_action | string | CREATE \| UPDATE \| DELETE |
| exam2p_user | string | Usuario que realizó la acción |
| exam2p_timestamp | Date | Fecha/hora de la acción |
| exam2p_detail | string | Información adicional |

---

## 🔌 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /exam2p-audit | Obtener registros (param: limit) |
| GET | /exam2p-audit/:id | Obtener registro por ID |
| POST | /exam2p-audit/test | Crear registro de prueba |
| GET | /health | Estado del servicio |

---

## 📬 Eventos

### RabbitMQ
- **Cola**: `exam2p.record.deleted`
- **Payload**: Objeto con campos de Exam2PAuditLog

### Webhook (hacia n8n)
- **Evento**: `exam2p.audit.deletion`
- **URL**: `http://localhost:5678/webhook/exam2p-audit-deletion`
- **Payload**:
```json
{
  "event": "exam2p.audit.deletion",
  "timestamp": "ISO_DATE",
  "data": {
    "exam2p_entity": "",
    "exam2p_recordId": 0,
    "exam2p_user": "",
    "exam2p_detail": ""
  }
}
```

---

## 🛠️ MCP Tool: exam2p_query_audit

- **Nombre**: `exam2p_query_audit`
- **Parámetros**: `limit` (opcional, number)
- **Conecta a**: `GET /exam2p-audit`

---

## 📊 Workflow n8n: exam2p-audit-workflow

```
Webhook → IF (DELETE) → HTTP Request (Gemini) → Telegram → Response
```

---

## ✅ Checklist del Examen

- [x] Microservicio `exam2p-audit-service`
- [x] Entidad `Exam2PAuditLog` (nombres EXACTOS)
- [x] Consumidor RabbitMQ (`exam2p.record.deleted`)
- [x] SQLite independiente
- [x] Webhook `exam2p.audit.deletion`
- [x] Endpoint `GET /exam2p-audit`
- [x] MCP Tool `exam2p_query_audit`
- [x] Workflow n8n `exam2p-audit-workflow`
- [x] docker-compose.yml
- [x] Documentación completa
