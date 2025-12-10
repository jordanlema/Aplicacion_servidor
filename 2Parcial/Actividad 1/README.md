# 🎓 Sistema de Inscripciones con Patrón Idempotent Consumer

## 📋 Descripción del Proyecto

Sistema de gestión de inscripciones a cursos implementando el patrón **Idempotent Consumer** para garantizar resiliencia ante mensajes duplicados en arquitectura de microservicios con comunicación asíncrona.

### 🎯 Objetivo

Demostrar cómo el patrón **Idempotent Consumer** previene el procesamiento duplicado de mensajes en sistemas distribuidos, asegurando que operaciones críticas (como reserva de cupos) se ejecuten una sola vez incluso cuando los mensajes se envíen múltiples veces.

---

## 🏗️ Arquitectura

### Componentes del Sistema

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
       ▼                     ▼
┌──────────────┐    ┌─────────────────┐
│ PostgreSQL   │    │   PostgreSQL    │
│  curso_db    │    │ inscripcion_db  │
└──────────────┘    └─────────────────┘
       │                     │
       └──────┬──────────────┘
              ▼
       ┌─────────────┐
       │   Redis     │  (Idempotencia)
       └─────────────┘
```

### 📊 Entidades

#### **Curso (Entidad Maestra)**
- `id`: UUID
- `nombre`: string
- `descripcion`: string
- `cupos_totales`: number
- `cupos_ocupados`: number
- `created_at`: timestamp

#### **Inscripción (Entidad Transaccional)**
- `id`: UUID
- `curso_id`: UUID
- `estudiante_nombre`: string
- `estudiante_email`: string
- `status`: PENDING | CONFIRMED | FAILED
- `message_id`: string (para idempotencia)
- `created_at`: timestamp

---

## 🔒 Patrón de Resiliencia: **Idempotent Consumer**

### ¿Qué es?

El **Idempotent Consumer** es un patrón que garantiza que un mensaje pueda ser procesado múltiples veces con el mismo resultado, evitando efectos secundarios duplicados.

### ¿Por qué lo necesitamos?

En sistemas distribuidos con mensajería asíncrona (RabbitMQ), los mensajes pueden:
- ✅ Duplicarse por reintentos automáticos
- ✅ Enviarse múltiples veces por errores de red
- ✅ Procesarse dos veces si el ACK falla

**Sin idempotencia**: Una inscripción podría reservar 2 cupos en lugar de 1  
**Con idempotencia**: El segundo mensaje se detecta y se ignora

### Implementación

#### 1️⃣ **Generación de Message ID único**
```typescript
const messageId = uuidv4();
```

#### 2️⃣ **Verificación en Redis (Operación Atómica)**
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

## 🧪 Pruebas de Idempotencia

### Prueba 1: Crear Datos Iniciales

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
