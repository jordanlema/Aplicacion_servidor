# 🎓 Sistema de Inscripciones con Microservicios, Webhooks y Edge Functions

## 📋 Descripción del Proyecto

Sistema enterprise de gestión de inscripciones a cursos implementando:
- **Patrón Idempotent Consumer** para garantizar resiliencia ante mensajes duplicados
- **Arquitectura orientada a eventos** con publicación de webhooks
- **Supabase Edge Functions** para procesamiento serverless de eventos
- **Seguridad HMAC-SHA256** para validación de webhooks
- **Protección contra replay attacks** con validación de timestamp

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Completa

```
┌─────────────┐
│  Cliente    │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────┐
│   ms-gateway        │  Puerto 3000
│  (API Gateway)      │
└──────┬──────┬───────┘
       │      │
       │      └─── HTTP ───┐
       │                   │
    RabbitMQ            RabbitMQ
       │                   │
       ▼                   ▼
┌──────────────┐    ┌─────────────────┐
│  ms-curso    │    │ ms-inscripcion  │
│ (Maestro)    │    │ (Transaccional) │
│ Puerto 3001  │    │  Puerto 3002    │
└──────┬───────┘    └────────┬────────┘
       │                     │
       │ Webhooks            │ Webhooks
       │ HMAC-SHA256         │ HMAC-SHA256
       │                     │
       ▼                     ▼
┌─────────────────────────────────────┐
│   SUPABASE EDGE FUNCTIONS           │
│  (Serverless - Deno Runtime)        │
├─────────────────────────────────────┤
│  📝 event-logger                    │
│  📧 notifier                        │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │   PostgreSQL  │
       │   (Supabase)  │
       └───────────────┘
       ┌───────────────┐
       │     Redis     │
       │ (Idempotencia)│
       └───────────────┘
```

### 📊 Entidades

#### **Curso (Entidad Maestra)**
```typescript
{
  id: UUID,
  nombre: string,
  descripcion: string,
  cupos_totales: number,
  cupos_ocupados: number,
  created_at: timestamp
}
```

#### **Inscripción (Entidad Transaccional)**
```typescript
{
  id: UUID,
  curso_id: UUID,
  estudiante_nombre: string,
  estudiante_email: string,
  status: 'PENDING' | 'CONFIRMED' | 'FAILED',
  message_id: string,
  created_at: timestamp
}
```

---

## 🔒 Estrategia Avanzada Implementada

### 1. Patrón Idempotent Consumer

**Objetivo**: Garantizar que operaciones críticas se ejecuten exactamente una vez, incluso ante mensajes duplicados.

**Implementación**:
```typescript
// Operación atómica en Redis
const isNew = await this.redis.set(
  `processed:${messageId}`,
  timestamp,
  'EX', 86400,  // TTL: 24 horas
  'NX'          // Solo si NO existe
);

if (!isNew) {
  // Mensaje ya procesado - retornar resultado existente
  return await this.getExistingInscripcion(messageId);
}
```

**Ventajas**:
- ✅ Operación atómica thread-safe
- ✅ Sin race conditions
- ✅ Limpieza automática con TTL
- ✅ Compartido entre múltiples instancias

### 2. Webhooks con Firma HMAC-SHA256

**Objetivo**: Garantizar autenticidad e integridad de eventos publicados.

**Implementación**:
```typescript
const timestamp = Math.floor(Date.now() / 1000);
const payload = JSON.stringify(event);
const message = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(message)
  .digest('hex');
```

**Headers enviados**:
```
X-Webhook-Signature: sha256=<signature>
X-Webhook-Timestamp: <unix_timestamp>
X-Webhook-Id: <event_id>
X-Idempotency-Key: <idempotency_key>
```

### 3. Protección contra Replay Attacks

**Validación de timestamp**:
```typescript
const requestTime = parseInt(timestamp);
const currentTime = Math.floor(Date.now() / 1000);
const timeDifference = Math.abs(currentTime - requestTime);

if (timeDifference > 300) { // 5 minutos
  throw new Error('Timestamp muy antiguo - posible replay attack');
}
```

### 4. Idempotencia en Edge Functions

**Verificación antes de procesar**:
```typescript
const { data: existing } = await supabase
  .from('webhook_events')
  .select('*')
  .eq('idempotency_key', payload.idempotency_key)
  .single();

if (existing) {
  return { success: true, message: 'Already processed' };
}
```

---

## 📡 Eventos Publicados

### Event: `course.created`

**Cuándo se publica**: Al crear un nuevo curso

**Payload**:
```json
{
  "event": "course.created",
  "version": "1.0",
  "id": "evt_1702740000_abc123",
  "idempotency_key": "course-8-created",
  "timestamp": "2025-12-18T10:30:00Z",
  "data": {
    "course_id": "8",
    "name": "Programación Web Avanzada",
    "description": "Curso de NestJS y microservicios",
    "total_slots": 10
  },
  "metadata": {
    "source": "ms-curso",
    "environment": "development"
  }
}
```

### Event: `enrollment.created`

**Cuándo se publica**: Al confirmar una inscripción

**Payload**:
```json
{
  "event": "enrollment.created",
  "version": "1.0",
  "id": "evt_1702740100_xyz789",
  "idempotency_key": "enrollment-45-created",
  "timestamp": "2025-12-18T10:31:00Z",
  "data": {
    "enrollment_id": 45,
    "student_name": "Juan Pérez",
    "student_email": "juan@universidad.edu",
    "course_id": "8",
    "status": "confirmed"
  },
  "metadata": {
    "source": "ms-inscripcion",
    "environment": "development"
  }
}
```

---

## 🚀 Instrucciones de Setup

### Prerrequisitos

- Node.js 18+
- Docker & Docker Compose
- Cuenta en Supabase (para Edge Functions)
- Supabase CLI

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd "Actividad 1"
```

### 2. Instalar Dependencias

```powershell
# Instalar todas las dependencias de los microservicios
.\install-deps.ps1
```

### 3. Configurar Variables de Entorno

Crear `.env` en cada microservicio:

**ms-gateway/.env**:
```env
PORT=3000
MS_CURSO_URL=http://localhost:3001
MS_INSCRIPCION_URL=http://localhost:3002
```

**ms-curso/.env**:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/curso_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
WEBHOOK_SECRET=your-super-secret-key-here
WEBHOOK_URL_EVENT_LOGGER=https://your-project.supabase.co/functions/v1/event-logger
WEBHOOK_URL_NOTIFIER=https://your-project.supabase.co/functions/v1/notifier
```

**ms-inscripcion/.env**:
```env
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/inscripcion_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
WEBHOOK_SECRET=your-super-secret-key-here
WEBHOOK_URL_EVENT_LOGGER=https://your-project.supabase.co/functions/v1/event-logger
WEBHOOK_URL_NOTIFIER=https://your-project.supabase.co/functions/v1/notifier
```

### 4. Iniciar Infraestructura (Docker)

```powershell
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432 y 5433)
- Redis (puerto 6379)
- RabbitMQ (puerto 5672, UI: 15672)

### 5. Configurar Supabase Edge Functions

**⚠️ IMPORTANTE: Configuración para Entorno Real**

#### 5.1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu `Project Reference ID` (aparece en Settings → General)
4. Anota tu `Project URL` (ej: `https://abcxyz.supabase.co`)

#### 5.2. Instalar Supabase CLI

```powershell
# Instalar con npm
npm install -g supabase

# Verificar instalación
supabase --version
```

#### 5.3. Login y Link al Proyecto

```powershell
cd "c:\Users\Lenovo\Desktop\jj\Actividad 1"

# Login en Supabase
supabase login

# Link al proyecto (usar tu Project Reference ID)
supabase link --project-ref YOUR_PROJECT_REF
```

#### 5.4. Crear el Schema en Supabase

```powershell
# Aplicar el schema a la base de datos
supabase db push

# O ejecutar manualmente desde el dashboard:
# 1. Ve a SQL Editor en Supabase Dashboard
# 2. Copia todo el contenido de supabase/schema.sql
# 3. Ejecuta el script
```

#### 5.5. Actualizar URLs en schema.sql

**ANTES de ejecutar el schema**, edita [supabase/schema.sql](supabase/schema.sql) línea ~140:

```sql
-- Reemplazar 'your-project' con tu Project Reference ID real
INSERT INTO webhook_subscriptions (event_type, url, secret, is_active) 
VALUES 
  (
    'course.created',
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-logger',  -- ← CAMBIAR AQUÍ
    'dev-secret-key-change-in-production',
    true
  ),
  ...
```

#### 5.6. Configurar Secrets

```powershell
# Secret compartido para firmas HMAC (CAMBIAR EN PRODUCCIÓN)
supabase secrets set WEBHOOK_SECRET="tu-secret-super-seguro-aqui-cambiar-en-prod"

# API Key de Resend para envío de emails (OPCIONAL)
supabase secrets set RESEND_API_KEY="re_tu_api_key_de_resend"

# Verificar secrets configurados
supabase secrets list
```

**Para obtener RESEND_API_KEY:**
1. Crea cuenta gratuita en [https://resend.com](https://resend.com)
2. Ve a API Keys y crea una nueva key
3. Copia el valor y ejecútalo en el comando de arriba

#### 5.7. Desplegar Edge Functions

```powershell
# Deploy event-logger
supabase functions deploy event-logger

# Deploy notifier
supabase functions deploy notifier

# Verificar deployment
supabase functions list
```

**Resultado esperado:**
```
┌──────────────────┬──────────┬─────────────────────────────────────┐
│ NAME             │ STATUS   │ URL                                 │
├──────────────────┼──────────┼─────────────────────────────────────┤
│ event-logger     │ ACTIVE   │ https://xyz.supabase.co/.../event-logger │
│ notifier         │ ACTIVE   │ https://xyz.supabase.co/.../notifier     │
└──────────────────┴──────────┴─────────────────────────────────────┘
```

#### 5.8. Actualizar Variables de Entorno en Microservicios

Edita los archivos `.env` de tus microservicios:

**ms-curso/.env**:
```env
WEBHOOK_SECRET=tu-secret-super-seguro-aqui-cambiar-en-prod
WEBHOOK_URL_EVENT_LOGGER=https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-logger
WEBHOOK_URL_NOTIFIER=https://YOUR_PROJECT_REF.supabase.co/functions/v1/notifier
```

**ms-inscripcion/.env**:
```env
WEBHOOK_SECRET=tu-secret-super-seguro-aqui-cambiar-en-prod
WEBHOOK_URL_EVENT_LOGGER=https://YOUR_PROJECT_REF.supabase.co/functions/v1/event-logger
WEBHOOK_URL_NOTIFIER=https://YOUR_PROJECT_REF.supabase.co/functions/v1/notifier
```

#### 5.9. Probar las Edge Functions

```powershell
# Test manual con curl
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))

# Necesitarás calcular la firma HMAC correcta
# O usar el sistema completo que lo hace automáticamente
```

### 6. Iniciar Microservicios

```powershell
# Terminal 1: Gateway
cd ms-gateway
npm run start:dev

# Terminal 2: ms-curso
cd ms-curso
npm run start:dev

# Terminal 3: ms-inscripcion
cd ms-inscripcion
npm run start:dev
```

### 7. Poblar Datos de Prueba (Opcional)

```powershell
.\seed-data.ps1
```

---

## 🧪 Ejemplos de Uso

### 1. Crear un Curso

```bash
curl -X POST http://localhost:3000/cursos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Programación Web Avanzada",
    "descripcion": "Curso de NestJS, React y microservicios",
    "cupos_totales": 10
  }'
```

**Respuesta**:
```json
{
  "message": "Curso creado",
  "message_id": "e4b2a7c9-1234-5678-90ab-cdef12345678",
  "curso": {
    "nombre": "Programación Web Avanzada",
    "descripcion": "Curso de NestJS, React y microservicios",
    "cupos_totales": 10
  }
}
```

**Webhook publicado**: `course.created` → Event Logger + Notifier

---

### 2. Crear Inscripción (Primera Vez)

```bash
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "idempotency_key": "test-inscripcion-001"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "isNew": true,
  "inscripcion": {
    "id": "a1b2c3d4-5678-90ab-cdef-123456789abc",
    "curso_id": "8",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "status": "CONFIRMED",
    "message_id": "test-inscripcion-001",
    "created_at": "2025-12-18T10:35:00.000Z"
  },
  "idempotency_key": "test-inscripcion-001"
}
```

**Acciones ejecutadas**:
1. ✅ Inscripción guardada en BD
2. ✅ Mensaje enviado a RabbitMQ
3. ✅ ms-curso reserva cupo
4. ✅ Webhook `enrollment.created` publicado

---

### 3. Duplicar Inscripción (Prueba de Idempotencia)

```bash
# EXACTAMENTE LA MISMA PETICIÓN
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "idempotency_key": "test-inscripcion-001"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Inscripción ya existía (idempotencia)",
  "isNew": false,
  "inscripcion": {
    "id": "a1b2c3d4-5678-90ab-cdef-123456789abc",
    "curso_id": "8",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "status": "CONFIRMED",
    "message_id": "test-inscripcion-001",
    "created_at": "2025-12-18T10:35:00.000Z"
  },
  "idempotency_key": "test-inscripcion-001"
}
```

**⚠️ Resultado**: 
- `isNew: false` → Idempotencia detectada
- Mismo `id` de inscripción
- NO se reservó cupo adicional
- NO se publicó webhook duplicado

---

### 4. Listar Cursos

```bash
curl http://localhost:3000/cursos
```

---

### 5. Listar Inscripciones

```bash
curl http://localhost:3000/inscripciones
```

---

### 6. Verificar Eventos en Supabase

```bash
# Event Logger
curl https://your-project.supabase.co/rest/v1/webhook_events \
  -H "apikey: your-anon-key"

# Notificaciones
curl https://your-project.supabase.co/rest/v1/processed_notifications \
  -H "apikey: your-anon-key"
```

---

## 📊 Diagramas

### Flujo de Creación de Inscripción con Idempotencia

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Cliente envía POST /inscripciones                        │
│    idempotency_key: "test-001"                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ms-inscripcion: Redis SET NX                             │
│    Key: "processed:test-001"                                │
│    Result: OK (nuevo)                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Guardar en BD + Enviar a RabbitMQ                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ms-curso: Redis SET NX                                   │
│    Key: "processed:reserve-test-001"                        │
│    Result: OK → Reservar cupo                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Publicar webhook enrollment.created                      │
│    • Generar firma HMAC                                     │
│    • Enviar a Edge Functions                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
    ┌───────────────────┐  ┌──────────────────┐
    │  event-logger     │  │  notifier        │
    │  ✓ Valida HMAC    │  │  ✓ Valida HMAC   │
    │  ✓ Idempotencia   │  │  ✓ Idempotencia  │
    │  ✓ Guarda en BD   │  │  ✓ Notifica      │
    └───────────────────┘  └──────────────────┘
```

### Flujo de Mensaje Duplicado (Idempotencia)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Cliente reenvía POST /inscripciones                      │
│    MISMO idempotency_key: "test-001"                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ms-inscripcion: Redis SET NX                             │
│    Key: "processed:test-001"                                │
│    Result: null (ya existe) ⚠️                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DETECCIÓN DE DUPLICADO                                   │
│    • NO se guarda en BD                                     │
│    • NO se envía a RabbitMQ                                 │
│    • Se retorna inscripción existente                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Respuesta: isNew = false                                 │
│    Cliente sabe que fue detectado como duplicado            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Scripts de Testing

### Test de Idempotencia

```powershell
.\test-idempotencia.ps1
```

Envía la misma inscripción 5 veces y verifica que solo se procese una vez.

### Test de Webhooks

```powershell
.\test-webhooks.ps1
```

Crea curso e inscripción, verifica que los webhooks sean recibidos y procesados correctamente.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: NestJS (Node.js)
- **Bases de Datos**: PostgreSQL (TypeORM)
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Serverless**: Supabase Edge Functions (Deno)
- **Contenedores**: Docker & Docker Compose
- **Lenguaje**: TypeScript

---

## 📁 Estructura del Proyecto

```
Actividad 1/
├── docker-compose.yml          # Infraestructura
├── install-deps.ps1            # Instalar dependencias
├── seed-data.ps1               # Datos de prueba
├── test-idempotencia.ps1       # Test idempotencia
├── test-webhooks.ps1           # Test webhooks
│
├── ms-gateway/                 # API Gateway
│   └── src/
│       ├── curso/
│       └── inscripcion/
│
├── ms-curso/                   # Microservicio Cursos
│   └── src/
│       ├── curso/
│       │   ├── curso.entity.ts
│       │   ├── curso.service.ts
│       │   └── curso.consumer.ts
│       ├── redis/
│       │   └── redis.service.ts
│       └── webhook/
│           └── webhook.service.ts
│
├── ms-inscripcion/             # Microservicio Inscripciones
│   └── src/
│       ├── inscripcion/
│       │   ├── inscripcion.entity.ts
│       │   ├── inscripcion.service.ts
│       │   └── inscripcion.controller.ts
│       ├── redis/
│       │   └── redis.service.ts
│       └── webhook/
│           └── webhook.service.ts
│
└── supabase/                   # Edge Functions
    ├── schema.sql              # Schema BD
    └── functions/
        ├── event-logger/       # Logger de eventos
        │   └── index.ts
        └── notifier/           # Notificaciones
            └── index.ts
```

---

## ✅ Checklist de Implementación

- [x] Patrón Idempotent Consumer con Redis
- [x] Comunicación asíncrona con RabbitMQ
- [x] Arquitectura de microservicios
- [x] Sistema de webhooks con HMAC-SHA256
- [x] Edge Functions en Supabase
- [x] Protección contra replay attacks
- [x] Idempotencia en webhooks
- [x] Documentación completa con diagramas
- [x] Ejemplos de uso con curl
- [x] Scripts de testing automatizados

---

## � Documentación Adicional

Para información técnica complementaria, consulta la carpeta [docs/](docs/):

- **[COMANDOS.md](docs/COMANDOS.md)**: Comandos útiles de Docker, Redis y RabbitMQ
- **[ESTRUCTURA.md](docs/ESTRUCTURA.md)**: Estructura detallada del proyecto
- **[GUIA-DEPLOY-SUPABASE.md](docs/GUIA-DEPLOY-SUPABASE.md)**: Guía completa de deploy en Supabase
- **[ERRORES-TYPESCRIPT-EXPLICACION.md](docs/ERRORES-TYPESCRIPT-EXPLICACION.md)**: Solución de errores TypeScript comunes
- **[NOTA-ERRORES-VSCODE.md](docs/NOTA-ERRORES-VSCODE.md)**: Errores conocidos de VSCode
- **[SOLUCION-ERRORES-SUPABASE.md](docs/SOLUCION-ERRORES-SUPABASE.md)**: Troubleshooting de Supabase

---

## �👥 Autor

Proyecto desarrollado para el curso de Arquitectura de Software

---

## 📄 Licencia

MIT
```typescript
// SET NX (Set if Not eXists) - Operación atómica
const isNew = await redis.set(
  `processed:${messageId}`,
  timestamp,
  'EX', 86400,  // TTL 24 horas
  'NX'          // Solo si NO existe
);

if (!isNew) {
  console.log('⚠️ Mensaje duplicado detectado');
  return; // IGNORAR
}
```

#### 3️⃣ **Procesamiento del mensaje**
```typescript
// Solo si es nuevo
await cursoService.reserveSpot(cursoId);
```

### Ventajas de usar Redis

✅ **Rendimiento**: Operaciones en memoria (< 1ms)  
✅ **Atomicidad**: SET NX es atómico (no hay race conditions)  
✅ **TTL automático**: Los registros expiran solos (no acumula basura)  
✅ **Escalable**: Puede ser compartido por múltiples instancias

---

## 🚀 Flujo de Operaciones

### Flujo Completo: Crear una Inscripción

```
1. Cliente → Gateway
   POST /inscripciones
   {
     curso_id, estudiante_nombre, estudiante_email,
     idempotency_key (opcional)
   }

2. Gateway → ms-inscripcion (HTTP)
   Agrega idempotency_key si no existe

3. ms-inscripcion:
   ✓ Verifica Redis: ¿Ya procesado?
   ✓ Marca como procesado (SET NX)
   ✓ Guarda inscripción en BD (PENDING)
   ✓ Envía mensaje a ms-curso (RabbitMQ)

4. ms-inscripcion → ms-curso (RabbitMQ)
   course.validate (validar curso)
   course.reserveSpot (reservar cupo)

5. ms-curso:
   ✓ Verifica Redis: ¿Ya procesado este message_id?
   ✓ Si es nuevo: reserva cupo, incrementa cupos_ocupados
   ✓ Si es duplicado: IGNORA (idempotencia)

6. ms-inscripcion:
   ✓ Actualiza status → CONFIRMED
   ✓ Retorna respuesta al Gateway
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.x | Framework para microservicios |
| **TypeScript** | 5.x | Lenguaje de programación |
| **PostgreSQL** | 17 | Base de datos relacional |
| **Redis** | 7 | Cache y deduplicación |
| **RabbitMQ** | 3.11 | Message broker (AMQP) |
| **Docker** | 20+ | Contenedores |
| **TypeORM** | 0.3.x | ORM para PostgreSQL |

---

## 📦 Instalación y Ejecución

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- Git

### Pasos de Instalación

```powershell
# 1. Clonar repositorio
git clone <tu-repo>
cd practicaweb-resilencia

# 2. Instalar dependencias en cada microservicio
cd ms-curso
npm install
cd ../ms-inscripcion
npm install
cd ../ms-gateway
npm install
cd ..

# 3. Levantar servicios con Docker
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

### Verificar que todo está corriendo

```powershell
# Ver contenedores activos
docker-compose ps

# Deberías ver:
# - rabbitmq (puertos 5672, 15672)
# - postgres_curso (puerto 5434)
# - postgres_inscripcion (puerto 5433)
# - redis (puerto 6379)
# - ms-curso (puerto 3001)
# - ms-inscripcion (puerto 3002)
# - ms-gateway (puerto 3000)
```

---

## 🧪 Pruebas de Validación del Sistema

### Configuración Previa

Asegúrate de tener:
- ✅ Microservicios corriendo (Gateway, ms-curso, ms-inscripcion)
- ✅ Infraestructura Docker activa (PostgreSQL, Redis, RabbitMQ)
- ✅ Edge Functions desplegadas en Supabase
- ✅ Variables de entorno configuradas

---

### PRUEBA 1: Happy Path - Flujo Completo End-to-End

**Objetivo**: Validar que todo el sistema funciona correctamente desde la creación de un curso hasta las notificaciones.

#### Paso 1: Crear un Curso

```bash
curl -X POST http://localhost:3000/cursos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Arquitectura de Software",
    "descripcion": "Curso completo de microservicios",
    "cupos_totales": 20
  }'
```

**Resultado Esperado:**
```json
{
  "message": "Curso creado",
  "message_id": "uuid-generado",
  "curso": {
    "nombre": "Arquitectura de Software",
    "descripcion": "Curso completo de microservicios",
    "cupos_totales": 20
  }
}
```

**Verificaciones:**
1. ✅ Logs de `ms-curso`: "📤 Publicando webhook: course.created"
2. ✅ Logs de Edge Function `event-logger`: "✅ Evento guardado"
3. ✅ Logs de Edge Function `notifier`: "✅ Correo enviado"
4. ✅ Tabla `webhook_events` en Supabase: Nuevo registro con event_type='course.created'
5. ✅ Email recibido (si Resend está configurado)

#### Paso 2: Crear una Inscripción

```bash
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "María García",
    "estudiante_email": "maria@universidad.edu",
    "idempotency_key": "test-happy-path-001"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "isNew": true,
  "inscripcion": {
    "id": "uuid-generado",
    "curso_id": "8",
    "estudiante_nombre": "María García",
    "status": "CONFIRMED"
  }
}
```

**Verificaciones:**
1. ✅ Inscripción guardada en BD de ms-inscripcion
2. ✅ Mensaje enviado a RabbitMQ
3. ✅ ms-curso reserva cupo (cupos_ocupados aumenta en 1)
4. ✅ Webhook `enrollment.created` publicado a Edge Functions
5. ✅ Evento registrado en tabla `webhook_events`
6. ✅ Email de confirmación enviado al estudiante

---

### PRUEBA 2: Validación de Firma HMAC

**Objetivo**: Verificar que webhooks con firma inválida sean rechazados.

#### Enviar Webhook con Firma Incorrecta

```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=FIRMA_INVALIDA_12345" \
  -H "X-Webhook-Timestamp: $(date +%s)" \
  -H "X-Webhook-Id: test-001" \
  -H "X-Idempotency-Key: test-hmac-001" \
  -d '{
    "event": "test.event",
    "version": "1.0",
    "id": "test-001",
    "idempotency_key": "test-hmac-001",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "data": {},
    "metadata": {
      "source": "test",
      "environment": "test",
      "correlation_id": "test"
    }
  }'
```

**Resultado Esperado:**
```json
{
  "error": "Invalid signature"
}
```

**Status Code**: `401 Unauthorized`

**Verificación:**
- ❌ Webhook NO es guardado en la base de datos
- 🛡️ Sistema protegido contra webhooks no autorizados

---

### PRUEBA 3: Idempotencia - Deduplicación de Mensajes Duplicados

**Objetivo**: Demostrar que el sistema detecta y evita procesar mensajes duplicados.

#### Enviar Primera Inscripción

```bash
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "Carlos Ruiz",
    "estudiante_email": "carlos@universidad.edu",
    "idempotency_key": "test-idempotencia-carlos-001"
  }'
```

**Resultado:**
```json
{
  "success": true,
  "isNew": true,
  "inscripcion": { "id": "abc-123", ... }
}
```

#### Enviar EXACTAMENTE el Mismo Mensaje (Duplicado)

```bash
# MISMA PETICIÓN - Simula reenvío por fallo de red
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "Carlos Ruiz",
    "estudiante_email": "carlos@universidad.edu",
    "idempotency_key": "test-idempotencia-carlos-001"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Inscripción ya existía (idempotencia)",
  "isNew": false,
  "inscripcion": { "id": "abc-123", ... }  ← MISMO ID
}
```

**Verificaciones:**
1. ✅ `isNew: false` indica que se detectó el duplicado
2. ✅ Mismo `id` de inscripción retornado
3. ✅ NO se guardó una segunda inscripción en la BD
4. ✅ NO se reservó un segundo cupo
5. ✅ NO se publicó un segundo webhook
6. ✅ Logs muestran: "⚠️ IDEMPOTENCIA: Esta inscripción ya fue procesada"

#### Verificar en Redis

```powershell
# Conectar a Redis
docker exec -it redis redis-cli

# Verificar que la clave de idempotencia existe
GET "processed:test-idempotencia-carlos-001"
# Resultado: timestamp del primer procesamiento

# Verificar TTL (debe expirar en 24 horas)
TTL "processed:test-idempotencia-carlos-001"
# Resultado: segundos restantes (~86400)
```

---

### PRUEBA 4: Protección contra Replay Attacks

**Objetivo**: Verificar que webhooks con timestamp antiguo sean rechazados.

#### Enviar Webhook con Timestamp Antiguo

```bash
# Timestamp de hace 10 minutos (más de 5 min de tolerancia)
OLD_TIMESTAMP=$(($(date +%s) - 600))

curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Timestamp: $OLD_TIMESTAMP" \
  -H "X-Webhook-Signature: sha256=..." \
  -H "X-Webhook-Id: replay-test-001" \
  -H "X-Idempotency-Key: replay-test-001" \
  -d '{ ... }'
```

**Resultado Esperado:**
```json
{
  "error": "Invalid or expired timestamp"
}
```

**Status Code**: `401 Unauthorized`

**Verificación:**
- 🛡️ Sistema rechaza webhooks antiguos (posible replay attack)
- ⏰ Tolerancia configurada: 5 minutos

---

### PRUEBA 5: Estrategia Avanzada - Idempotent Consumer Multinivel

**Objetivo**: Demostrar que la idempotencia funciona en TODAS las capas del sistema.

#### Escenario: Mensaje Duplicado en RabbitMQ

```bash
# 1. Crear inscripción
curl -X POST http://localhost:3000/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": "8",
    "estudiante_nombre": "Ana Torres",
    "estudiante_email": "ana@universidad.edu",
    "idempotency_key": "test-multinivel-001"
  }'
```

**Verificar en Múltiples Capas:**

**Capa 1: ms-inscripcion (Redis)**
```powershell
docker exec -it redis redis-cli
GET "processed:test-multinivel-001"
# Resultado: timestamp (mensaje procesado)
```

**Capa 2: ms-curso (Redis)**
```powershell
docker exec -it redis redis-cli
GET "processed:reserve-test-multinivel-001"
# Resultado: timestamp (cupo reservado una sola vez)
```

**Capa 3: Edge Functions (PostgreSQL)**
```sql
-- Conectar a Supabase y ejecutar:
SELECT * FROM webhook_events 
WHERE idempotency_key LIKE '%test-multinivel-001%';

-- Resultado: Solo 1 registro
```

**Simulación de Duplicado:**
- Si el mensaje de RabbitMQ se reenvía → ms-curso detecta con Redis
- Si el webhook se reenvía → Edge Function detecta con PostgreSQL
- ✅ **Triple protección** garantiza exactly-once processing

---

### PRUEBA 6: Observabilidad y Rastreo de Eventos

**Objetivo**: Demostrar capacidad de rastrear eventos a través de todo el sistema.

#### Consultar Estadísticas en Supabase

```sql
-- Eventos por tipo
SELECT * FROM v_events_by_type;

-- Eventos recientes
SELECT * FROM v_recent_events LIMIT 10;

-- Estadísticas de notificaciones
SELECT * FROM v_notification_stats;

-- Verificar evento específico por correlation_id
SELECT 
  event_type,
  source,
  correlation_id,
  processed_at,
  payload->'data' as event_data
FROM webhook_events
WHERE correlation_id = 'req_abc123xyz';
```

**Verificación:**
- ✅ Trazabilidad completa con `correlation_id`
- ✅ Logs estructurados en JSON
- ✅ Métricas de éxito/fallo disponibles
- ✅ Auditoría inmutable de todos los eventos

---

## 📋 Checklist de Validación Completa

Marca cada item después de ejecutar la prueba:

- [ ] **Prueba 1: Happy Path** - Sistema funciona end-to-end
- [ ] **Prueba 2: Validación HMAC** - Webhooks no autorizados son rechazados
- [ ] **Prueba 3: Idempotencia** - Duplicados son detectados y manejados correctamente
- [ ] **Prueba 4: Replay Attack** - Timestamps antiguos son rechazados  
- [ ] **Prueba 5: Estrategia Multinivel** - Idempotencia funciona en todas las capas
- [ ] **Prueba 6: Observabilidad** - Eventos son rastreables con correlation IDs

---

## 🧪 Scripts de Testing Automatizado

### Test de Idempotencia

```powershell
# Ejecutar script de seed
.\seed-data.ps1
```

Esto creará 3 cursos de prueba. **Copia uno de los IDs del curso** de los logs de `ms-curso`.

### Prueba 2: Demostración de Idempotencia

```powershell
# Edita test-idempotencia.ps1 y reemplaza REEMPLAZAR_CON_ID_REAL con un curso_id real

# Ejecutar prueba
.\test-idempotencia.ps1
```

**Resultado esperado:**
```
✅ Primera inscripción: isNew = true
⚠️  Segunda inscripción: isNew = false (duplicado detectado)
✅ Mismo ID de inscripción retornado
✅ Cupo reservado UNA SOLA VEZ
```

### Prueba 3: Prueba Manual con cURL/Postman

#### Crear un curso
```bash
POST http://localhost:3000/cursos
Content-Type: application/json

{
  "nombre": "Curso de Prueba",
  "descripcion": "Para testing",
  "cupos_totales": 5
}
```

#### Crear inscripción (primera vez)
```bash
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "<ID_DEL_CURSO>",
  "estudiante_nombre": "Test User",
  "estudiante_email": "test@test.com",
  "idempotency_key": "test-key-123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "isNew": true,
  "inscripcion": { ... }
}
```

#### Duplicar el mensaje (misma petición)
```bash
# Enviar EXACTAMENTE la misma petición de nuevo
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "<ID_DEL_CURSO>",
  "estudiante_nombre": "Test User",
  "estudiante_email": "test@test.com",
  "idempotency_key": "test-key-123"  ← MISMO KEY
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción ya existía (idempotencia)",
  "isNew": false,  ← ¡DETECTÓ DUPLICADO!
  "inscripcion": { ... }  ← Mismo ID que antes
}
```

---

## 📊 Verificación en los Logs

### Logs de ms-curso (Microservicio A)

```
📥 [course.reserveSpot] Mensaje recibido
   Message ID: reserve-abc-123
   Curso ID: xyz-789

🆕 Mensaje nuevo - Procesando reserva de cupo...
✅ Cupo reservado en curso "Programación Web". Cupos: 1/5

--- Segunda vez (duplicado) ---

📥 [course.reserveSpot] Mensaje recibido
   Message ID: reserve-abc-123
   Curso ID: xyz-789

⚠️  Mensaje DUPLICADO detectado - Reserva ya procesada (idempotencia aplicada)
   ✅ RESILIENCIA DEMOSTRADA: El sistema evitó reservar el cupo dos veces
```

### Logs de ms-inscripcion (Microservicio B)

```
🌐 POST /inscripciones recibido

🔵 Iniciando creación de inscripción...
   Message ID: abc-123
   Curso: xyz-789
   Estudiante: Juan Pérez

🆕 Mensaje nuevo - Procesando inscripción...
✅ Inscripción creada en BD: inscripcion-id-456
📤 Enviando reserva de cupo a ms-curso...
✅ Inscripción CONFIRMADA

--- Segunda vez (duplicado) ---

🔵 Iniciando creación de inscripción...
   Message ID: abc-123

⚠️  IDEMPOTENCIA: Esta inscripción ya fue procesada
   ✅ Retornando inscripción existente: inscripcion-id-456
```

---

## 🎯 Demostración de Resiliencia

### Escenarios Cubiertos

| Escenario | Sin Idempotencia | Con Idempotencia |
|-----------|------------------|------------------|
| **Mensaje duplicado** | ❌ Reserva 2 cupos | ✅ Ignora duplicado |
| **Retry de RabbitMQ** | ❌ Procesa 2 veces | ✅ Procesa 1 vez |
| **Fallo de ACK** | ❌ Doble procesamiento | ✅ Detecta procesado |
| **Cliente reintenta** | ❌ Múltiples inscripciones | ✅ Misma inscripción |

### Prueba en Vivo

1. **Enviar inscripción**
2. **Duplicar manualmente el mensaje en RabbitMQ** (Management UI: http://localhost:15672)
3. **Observar los logs**: Segunda ejecución muestra "⚠️ Duplicado detectado"
4. **Verificar BD**: Solo 1 registro, solo 1 cupo reservado

---

## 📁 Estructura del Proyecto

```
practicaweb-resilencia/
├── ms-curso/               # Microservicio A (Maestro)
│   ├── src/
│   │   ├── animal/         # Lógica de cursos (carpeta interna se mantiene)
│   │   │   ├── animal.entity.ts      → Curso entity
│   │   │   ├── animal.service.ts     → CursoService
│   │   │   └── animal.consumert.ts   → CursoConsumer (RabbitMQ)
│   │   ├── redis/
│   │   │   └── redis.service.ts      → RedisService (Idempotencia)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── ms-inscripcion/         # Microservicio B (Transaccional)
│   ├── src/
│   │   ├── adoption/       # Lógica de inscripciones (carpeta interna se mantiene)
│   │   │   ├── adoption.entity.ts     → Inscripcion entity
│   │   │   ├── adoption.service.ts    → InscripcionService
│   │   │   └── adoption.controller.ts → InscripcionController (HTTP)
│   │   ├── redis/
│   │   │   └── redis.service.ts       → RedisService (Idempotencia)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── ms-gateway/             # API Gateway
│   ├── src/
│   │   ├── animal/         # Endpoints de cursos
│   │   │   ├── animal.controller.ts   → CursoController
│   │   │   └── animal.module.ts       → CursoModule
│   │   ├── adoption/       # Endpoints de inscripciones
│   │   │   ├── adoption.controller.ts → InscripcionController
│   │   │   └── adoption.module.ts     → InscripcionModule
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Orquestación de servicios
├── seed-data.ps1           # Script para crear datos iniciales
├── test-idempotencia.ps1   # Script de prueba de idempotencia
└── README.md               # Este archivo
```

---

## 🔧 Configuración

### Variables de Entorno

#### ms-curso
```env
DATABASE_HOST=postgres_curso
DATABASE_PORT=5432
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3001
```

#### ms-inscripcion
```env
DATABASE_HOST=postgres_inscripcion
DATABASE_PORT=5432
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3002
```

#### ms-gateway
```env
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
PORT=3000
```

---

## 📚 Endpoints de la API

### Gateway (Puerto 3000)

#### Cursos
- `POST /cursos` - Crear curso
  ```json
  {
    "nombre": "string",
    "descripcion": "string",
    "cupos_totales": number
  }
  ```

#### Inscripciones
- `POST /inscripciones` - Crear inscripción (con idempotencia)
  ```json
  {
    "curso_id": "uuid",
    "estudiante_nombre": "string",
    "estudiante_email": "string",
    "idempotency_key": "string (opcional)"
  }
  ```
  
  **Headers opcionales:**
  - `Idempotency-Key`: UUID para control de idempotencia

- `GET /inscripciones` - Listar todas las inscripciones

---

## 🐛 Troubleshooting

### Redis no conecta
```powershell
# Verificar que Redis está corriendo
docker-compose logs redis

# Reiniciar Redis
docker-compose restart redis
```

### RabbitMQ no recibe mensajes
```powershell
# Ver management UI
# http://localhost:15672
# Usuario: guest / Contraseña: guest

# Verificar que las colas existen:
# - curso_queue
```

### Base de datos no conecta
```powershell
# Ver logs de PostgreSQL
docker-compose logs postgres_curso
docker-compose logs postgres_inscripcion
```

---

## 📖 Referencias

- [Patrón Idempotent Consumer - Microsoft](https://docs.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Redis SET NX](https://redis.io/commands/set/)
- [RabbitMQ Message Deduplication](https://www.rabbitmq.com/docs/confirms)

---

## 👨‍💻 Autor

**Tu Nombre**
- Universidad: [Tu Universidad]
- Curso: Programación Web / Arquitectura de Software
- Fecha: Diciembre 2025

---

## 📝 Notas para la Presentación

### Puntos Clave a Mencionar

1. **Problema que resuelve**: Mensajes duplicados en sistemas distribuidos
2. **Solución elegida**: Idempotent Consumer (la más sencilla del taller)
3. **Tecnología clave**: Redis con operación atómica SET NX
4. **Demostración**: Script que envía el mismo mensaje 2 veces
5. **Resultado**: Segunda ejecución detecta duplicado y lo ignora

### Flujo de Demostración en Vivo

1. Levantar servicios: `docker-compose up`
2. Crear curso: `.\seed-data.ps1`
3. Ejecutar prueba: `.\test-idempotencia.ps1`
4. Mostrar logs donde se ve "⚠️ Mensaje DUPLICADO detectado"
5. Mostrar que solo se reservó 1 cupo (consultar BD o endpoint GET)

---

## ✅ Checklist de Entrega

- [x] Código fuente completo
- [x] Docker Compose funcional
- [x] README con documentación
- [x] Patrón de resiliencia implementado (Idempotent Consumer)
- [x] Scripts de prueba
- [x] Arquitectura de microservicios (sin HTTP entre servicios)
- [x] Entidades Curso (Maestra) e Inscripción (Transaccional)
- [x] Comunicación asíncrona con RabbitMQ
- [x] Idempotencia con Redis (SET NX)
