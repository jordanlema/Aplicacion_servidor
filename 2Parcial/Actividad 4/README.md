# 🧩 Actividad 4: n8n - Automatización de Workflows con IA

## 📋 Descripción General

Este taller integra **n8n** como capa de automatización de workflows sobre la arquitectura existente de microservicios. El sistema completo ahora consta de 4 capas interconectadas que permiten procesar eventos del backend y ejecutar acciones automatizadas.

## 🏗️ Arquitectura Final (4 Capas)

| Capa | Componente | Puerto | Función |
|------|-----------|--------|---------|
| 1 | API Gateway + Gemini | 3000 | Interpreta texto y decide tools |
| 2 | MCP Server | 3001 | Expone tools (JSON-RPC) |
| 3 | Backend NestJS | 3002 | CRUD + emite eventos |
| 4 | **n8n (NUEVO)** | 5678 | Automatiza consecuencias |

### 💡 Principio de Diseño

> **El backend emite eventos y no sabe qué pasa después**

Los microservicios de backend se limitan a ejecutar la lógica de negocio y emitir eventos. n8n se suscribe a estos eventos y ejecuta workflows automatizados sin acoplamiento directo.

## 📂 Estructura del Proyecto

```
Actividad 4/
├── n8n/
│   ├── docker-compose.yml          # Configuración de n8n con Docker
│   ├── workflows/
│   │   ├── 01-notificacion-tiempo-real.json
│   │   ├── 02-sincronizacion-sheets.json
│   │   └── 03-alerta-critica.json
│   └── README.md
├── docs/
│   ├── INSTALACION.md
│   ├── CONFIGURACION.md
│   ├── WORKFLOWS.md
│   └── INTEGRACIONES.md
└── README.md                        # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

Antes de ejecutar este taller, debes tener funcionando:

✅ Backend NestJS (Actividad 1)  
✅ Webhooks / Serverless (Actividad 2)  
✅ MCP + Gemini (Actividad 3)  
✅ SQLite funcionando  
✅ Docker y Docker Compose instalados

### 1. Levantar n8n

```powershell
# Desde la carpeta n8n
cd "Actividad 4/n8n"
docker-compose up -d
```

### 2. Acceder a n8n

- URL: http://localhost:5678
- Usuario: `admin`
- Contraseña: `admin123`

### 3. Importar Workflows

1. Accede a n8n
2. Ve a **Workflows** → **Import from File**
3. Importa los 3 archivos JSON de la carpeta `workflows/`

### 4. Configurar Credenciales

Debes configurar las siguientes credenciales en n8n:

#### Telegram API
- Obtén un token de [@BotFather](https://t.me/botfather)
- Configura el Chat ID de tu grupo/usuario

#### Google Sheets API
- Crea un proyecto en Google Cloud Console
- Habilita Google Sheets API
- Configura OAuth 2.0

#### Gemini API
- Obtén API Key desde [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `n8n/`:

```env
# Telegram
TELEGRAM_CHAT_ID=tu_chat_id

# Google Sheets
GOOGLE_SHEETS_ID=tu_spreadsheet_id

# Email (para alertas medias)
EMAIL_FROM=tu_email@ejemplo.com
EMAIL_ADMIN=admin@ejemplo.com
```

## 🔄 Workflows Implementados

### 🟦 Workflow 1: Notificación en Tiempo Real (25 puntos)

**Propósito:** Notificar automáticamente cuando ocurre una inscripción.

**Flujo:**
```
Webhook 
→ IF (validar datos) 
→ Set (transformar) 
→ Gemini (generar mensaje) 
→ Telegram 
→ Respond to Webhook
```

**Evento disparador:** `inscripcion.creada`

**Webhook URL:** `http://localhost:5678/webhook/inscripcion.creada`

### 🟦 Workflow 2: Sincronización con Google Sheets (20 puntos)

**Propósito:** Registrar cada evento importante para control administrativo.

**Flujo:**
```
Webhook 
→ Set (transformar) 
→ Google Sheets (Append Row) 
→ Respond to Webhook
```

**Columnas en Google Sheets:**
- Fecha
- Tipo de evento
- Curso
- Estudiante
- Estado
- Curso ID
- Inscripción ID
- Email
- Criticidad
- Origen

**Webhook URL:** `http://localhost:5678/webhook/eventos`

### 🟦 Workflow 3: Alertas de Condiciones Críticas (20 puntos)

**Propósito:** Evaluar situaciones críticas con IA.

**Flujo:**
```
Webhook 
→ IF (¿crítico?) 
→ Gemini (analizar urgencia) 
→ Switch (Alta / Media / Baja)
```

**Acciones por nivel:**
- 🔴 **Alta** → Telegram (notificación inmediata)
- 🟡 **Media** → Email (notificación por correo)
- 🟢 **Baja** → Log (registro en archivo)

**Webhook URL:** `http://localhost:5678/webhook/alertas`

## 🔧 Modificación del Backend

Se agregó el servicio `WebhookEmitterService` para emitir eventos a n8n:

**Ubicación:** `Actividad 1/ms-curso/src/common/webhook-emitter.service.ts`

### Eventos Emitidos

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `inscripcion.creada` | Principal | Se creó una nueva inscripción |
| `curso.cupos_agotados` | Crítico | Un curso llenó todos sus cupos |
| `inscripcion.cancelada` | Informativo | Se canceló una inscripción |

### Ejemplo de Uso en el Código

```typescript
// En el servicio de inscripciones
await this.webhookEmitter.emitInscripcionCreada({
  inscripcionId: inscripcion.id,
  cursoId: curso.id,
  cursoNombre: curso.nombre,
  estudianteNombre: estudiante.nombre,
  estudianteEmail: estudiante.email,
  fecha: new Date(),
});
```

## 🌐 Flujo End-to-End

### Escenario Típico

1. **Usuario escribe:**
   ```
   "Inscribe a Juan Pérez en Programación Web"
   ```

2. **Gemini decide tools** (Taller 3)
   - Interpreta la intención
   - Selecciona la tool `inscribir_estudiante`

3. **Backend registra inscripción** (Taller 1)
   - Valida datos
   - Crea registro en base de datos
   - Emite evento `inscripcion.creada`

4. **n8n ejecuta workflows** (Taller 4)
   - ✉️ Notifica por Telegram
   - 📊 Registra en Google Sheets
   - ⚠️ Evalúa si hay alertas críticas

5. **Usuario recibe confirmación**
   - Respuesta del Gateway
   - Notificación en Telegram

## 📊 Google Sheets - Plantilla

Crea una hoja de cálculo con las siguientes columnas:

| Fecha | Tipo de Evento | Curso | Estudiante | Estado | Curso ID | Inscripción ID | Email | Criticidad | Origen |
|-------|---------------|-------|------------|--------|----------|---------------|-------|-----------|--------|

**Hoja:** Nombra la pestaña como `Eventos`

## 🧪 Pruebas y Validación

### Probar Workflow 1 (Notificaciones)

```powershell
# Enviar evento de prueba
curl -X POST http://localhost:5678/webhook/inscripcion.creada `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.creada",
    "timestamp": "2026-01-13T10:00:00Z",
    "datos": {
      "inscripcion_id": "123",
      "curso_id": "456",
      "curso_nombre": "Programación Web",
      "estudiante_nombre": "Juan Pérez",
      "estudiante_email": "juan@ejemplo.com",
      "fecha_inscripcion": "2026-01-13T10:00:00Z"
    },
    "metadata": {
      "origen": "ms-inscripcion",
      "version": "1.0"
    }
  }'
```

### Probar Workflow 2 (Google Sheets)

```powershell
# Enviar evento genérico
curl -X POST http://localhost:5678/webhook/eventos `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.creada",
    "timestamp": "2026-01-13T10:00:00Z",
    "datos": {
      "curso_nombre": "Programación Web",
      "estudiante_nombre": "Juan Pérez",
      "curso_id": "456",
      "inscripcion_id": "123",
      "estudiante_email": "juan@ejemplo.com"
    },
    "metadata": {
      "origen": "ms-inscripcion"
    }
  }'
```

### Probar Workflow 3 (Alertas)

```powershell
# Enviar alerta crítica
curl -X POST http://localhost:5678/webhook/alertas `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "curso.cupos_agotados",
    "criticidad": "alta",
    "timestamp": "2026-01-13T10:00:00Z",
    "datos": {
      "curso_id": "456",
      "curso_nombre": "Programación Web",
      "cupos_maximos": 30,
      "inscritos_actuales": 30
    },
    "metadata": {
      "origen": "ms-curso",
      "requiere_accion": true
    }
  }'
```

## 📝 Comandos Útiles

```powershell
# Iniciar n8n
docker-compose up -d

# Ver logs de n8n
docker-compose logs -f n8n

# Detener n8n
docker-compose down

# Reiniciar n8n (preservando datos)
docker-compose restart

# Eliminar todo (incluidos datos)
docker-compose down -v
```

## 🔒 Seguridad

### En Desarrollo
- Usuario/Contraseña básicos configurados en docker-compose.yml
- Webhooks sin autenticación para facilitar pruebas

### En Producción (Recomendado)
- Usar variables de entorno seguras
- Implementar autenticación en webhooks
- Configurar HTTPS
- Restringir acceso por IP

## 📚 Documentación Adicional

- [INSTALACION.md](docs/INSTALACION.md) - Guía detallada de instalación
- [CONFIGURACION.md](docs/CONFIGURACION.md) - Configuración de credenciales
- [WORKFLOWS.md](docs/WORKFLOWS.md) - Explicación detallada de workflows
- [INTEGRACIONES.md](docs/INTEGRACIONES.md) - Guías de integración

## 🎯 Criterios de Evaluación

| Item | Puntos | Descripción |
|------|--------|-------------|
| Workflow 1 | 25 | Notificación en tiempo real con Gemini |
| Workflow 2 | 20 | Sincronización con Google Sheets |
| Workflow 3 | 20 | Alertas críticas con IA |
| Flujo End-to-End | 10 | Demostración completa |
| Documentación | 10 | README y guías |
| Integración Backend | 10 | WebhookEmitterService |
| Pruebas | 5 | Evidencias de funcionamiento |
| **TOTAL** | **100** | |

## 🐛 Troubleshooting

### n8n no inicia
```powershell
# Verificar logs
docker-compose logs n8n

# Verificar puertos
netstat -ano | findstr :5678
```

### Webhooks no responden
1. Verificar que los workflows estén activos
2. Revisar las URLs de webhook en n8n
3. Verificar logs de ejecución en n8n

### Google Sheets no actualiza
1. Verificar credenciales OAuth 2.0
2. Asegurar que el Spreadsheet ID es correcto
3. Verificar permisos de la cuenta de servicio

## 👥 Autor

Taller 4 - n8n Workflow Automation  
Enero 2026

## 📄 Licencia

Este proyecto es parte de un taller educativo.
