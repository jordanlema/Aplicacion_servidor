# Taller 3 - Sistema de Gestión de Inscripciones con IA y MCP

## 📋 Descripción del Dominio

Sistema de gestión académica que permite inscribir estudiantes a cursos mediante **procesamiento de lenguaje natural** con IA. El sistema orquesta automáticamente tres operaciones críticas:

### Entidades Principales

**Curso**
- ID (UUID)
- Nombre
- Descripción
- Cupos totales
- Cupos ocupados
- Cupos disponibles (calculado)

**Inscripción**
- ID (UUID)
- Curso ID
- Estudiante (nombre/ID)
- Email del estudiante
- Estado (PENDING, CONFIRMED)
- Fecha de creación
- Message ID (idempotencia)

### Problema que Resuelve

Tradicionalmente, inscribir un estudiante requiere múltiples pasos manuales:
1. Buscar el curso en el sistema
2. Verificar disponibilidad de cupos
3. Validar requisitos
4. Crear la inscripción
5. Actualizar contadores

**Con este sistema**, el usuario solo envía:
```
"Quiero inscribirme al curso de Node.js con el estudiante ID 3"
```

Y la **IA orquesta automáticamente** todas las operaciones necesarias.

---

## 🏗️ Arquitectura MCP (Model Context Protocol)

### ¿Qué es MCP?

**Model Context Protocol** es un protocolo estándar que permite que los LLMs (Large Language Models) interactúen con herramientas externas de forma estructurada. En lugar de que la IA genere texto, **ejecuta acciones reales** en sistemas externos.

### Componentes de la Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO                              │
│  "Inscríbeme al curso de Node.js con estudiante ID 3"  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 API GATEWAY (NestJS)                    │
│  Puerto: 3000                                           │
│  - Recibe lenguaje natural                              │
│  - Conecta con MCP Server                               │
│  - Conecta con Gemini AI (o modo DEMO)                  │
└────────────┬───────────────────┬────────────────────────┘
             │                   │
             │ stdio             │ HTTP
             ▼                   ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│   MCP SERVER         │  │    GEMINI AI                 │
│   (JSON-RPC 2.0)     │  │    (Function Calling)        │
│                      │  │    - Decide qué tools usar   │
│  Tools disponibles:  │  │    - Orquesta el flujo       │
│  • buscar_curso      │  │                              │
│  • validar_cupos     │  │  (o MODO DEMO: simulado)     │
│  • crear_inscripcion │  │                              │
└──────────┬───────────┘  └──────────────────────────────┘
           │ HTTP
           ▼
┌─────────────────────────────────────────────────────────┐
│              MICROSERVICIOS (Docker)                    │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────┐   │
│  │   ms-curso       │      │   ms-inscripcion     │   │
│  │   Puerto: 3001   │      │   Puerto: 3002       │   │
│  │   - GET /cursos  │      │   - POST /inscripc.. │   │
│  │   - GET /cursos/:│      │   - GET /inscripc..  │   │
│  └────────┬─────────┘      └──────────┬───────────┘   │
│           │                            │               │
│  ┌────────▼─────────┐      ┌──────────▼───────────┐   │
│  │ postgres_curso   │      │ postgres_inscripcion │   │
│  │ Puerto: 5434     │      │ Puerto: 5433         │   │
│  └──────────────────┘      └──────────────────────┘   │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────┐   │
│  │    RabbitMQ      │      │      Redis           │   │
│  │  Puerto: 5672    │      │   Puerto: 6379       │   │
│  └──────────────────┘      └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos MCP

1. **Cliente** → envía petición al API Gateway
2. **API Gateway** → conecta con MCP Server vía stdio (JSON-RPC 2.0)
3. **MCP Server** → expone 3 tools como funciones llamables
4. **Gemini AI** → decide qué tools ejecutar y en qué orden
5. **API Gateway** → llama tools a través del MCP Client
6. **MCP Server** → ejecuta tools llamando a microservicios HTTP
7. **Microservicios** → realizan operaciones en BD y responden
8. **Respuesta** → sube por toda la cadena hasta el usuario

---

## 🛠️ Tools Implementados

El MCP Server expone **3 tools** que la IA puede usar:

### 1️⃣ buscar_curso (🔍 Búsqueda)

**Tipo:** Tool de búsqueda  
**Propósito:** Encontrar cursos por nombre (búsqueda parcial)

**Input:**
```typescript
{
  nombre: string // "Node.js", "Web", "Programación"
}
```

**Output:**
```json
{
  "success": true,
  "cursos": [
    {
      "id": "5a5cd2fd-3e69-42ca-8088-0181bb1a0e5a",
      "nombre": "Programacion con Node.js",
      "descripcion": "Curso completo de Node.js",
      "cupos_totales": 30,
      "cupos_ocupados": 1
    }
  ],
  "total": 1
}
```

**Endpoint Backend:** `GET http://localhost:3001/cursos?nombre={nombre}`

---

### 2️⃣ validar_cupos (✅ Validación)

**Tipo:** Tool de validación  
**Propósito:** Verificar si un curso existe y tiene cupos disponibles

**Input:**
```typescript
{
  curso_id: string // UUID del curso
}
```

**Output:**
```json
{
  "success": true,
  "valid": true,
  "message": "El curso \"Programacion con Node.js\" tiene 29 cupos disponibles",
  "curso": {
    "id": "5a5cd2fd-3e69-42ca-8088-0181bb1a0e5a",
    "nombre": "Programacion con Node.js",
    "cupos_disponibles": 29,
    "cupos_totales": 30,
    "cupos_ocupados": 1
  }
}
```

**Endpoint Backend:** `GET http://localhost:3001/cursos/{curso_id}`

---

### 3️⃣ crear_inscripcion (⚙️ Acción)

**Tipo:** Tool de acción  
**Propósito:** Registrar la inscripción de un estudiante

**Input:**
```typescript
{
  estudiante: string, // "1", "2", "Juan Pérez"
  curso_id: string    // UUID del curso
}
```

**Output:**
```json
{
  "success": true,
  "message": "1 fue inscrito correctamente",
  "inscripcion": {
    "id": "3dd50b41-f1e0-4e9d-9c06-1acf6954e0d2",
    "estudiante": "1",
    "curso_id": "5a5cd2fd-3e69-42ca-8088-0181bb1a0e5a",
    "estado": "CONFIRMED",
    "fecha": "2026-01-08T21:33:55.232Z"
  }
}
```

**Endpoint Backend:** `POST http://localhost:3002/inscripciones`

---

## 🔄 Flujo Paso a Paso

### Ejemplo: "Quiero inscribirme al curso de Node.js con el estudiante ID 3"

```
1. USUARIO envía mensaje natural
   POST http://localhost:3000/inscripcion/process
   Body: { "message": "Quiero inscribirme al curso de Node.js con el estudiante ID 3" }

2. API GATEWAY recibe y procesa
   - Extrae estudiante_id del mensaje (regex)
   - Decide si usar Gemini AI o modo DEMO

3. MODO DEMO (simulación de IA)
   Paso 1: Buscar curso
   ├─ Llama tool: buscar_curso({ nombre: "Node.js" })
   ├─ MCP Server → GET http://localhost:3001/cursos?nombre=Node.js
   ├─ Respuesta: [{ id: "5a5cd2fd...", nombre: "Programacion con Node.js", ... }]
   └─ ✅ Curso encontrado

   Paso 2: Validar cupos
   ├─ Llama tool: validar_cupos({ curso_id: "5a5cd2fd..." })
   ├─ MCP Server → GET http://localhost:3001/cursos/5a5cd2fd...
   ├─ Respuesta: { valid: true, cupos_disponibles: 29, ... }
   └─ ✅ Hay 29 cupos disponibles

   Paso 3: Crear inscripción
   ├─ Llama tool: crear_inscripcion({ estudiante: "3", curso_id: "5a5cd2fd..." })
   ├─ MCP Server → POST http://localhost:3002/inscripciones
   │   Body: { estudiante_nombre: "3", estudiante_email: "estudiante3@example.com", ... }
   ├─ ms-inscripcion → Valida con ms-curso (RabbitMQ)
   ├─ ms-curso → Reserva cupo (decrementa cupos_disponibles)
   ├─ ms-inscripcion → Guarda en BD
   └─ ✅ Inscripción creada: ID 3dd50b41-f1e0-4e9d-9c06-1acf6954e0d2

4. API GATEWAY formatea respuesta
   "✅ ¡Inscripción exitosa!
    📚 Curso: Programacion con Node.js
    👤 Estudiante ID: 3
    📅 Fecha: 2026-01-08T21:33:55.232Z
    🎫 ID Inscripción: 3dd50b41-f1e0-4e9d-9c06-1acf6954e0d2
    El curso tiene 28 cupos disponibles restantes."

5. USUARIO recibe confirmación
```

### Diagrama de Secuencia

```
Usuario          API Gateway      MCP Server       ms-curso        ms-inscripcion
   │                  │                │               │                  │
   │─── POST ────────>│                │               │                  │
   │  inscripcion/    │                │               │                  │
   │  process         │                │               │                  │
   │                  │                │               │                  │
   │                  │──buscar_curso─>│               │                  │
   │                  │                │─GET /cursos──>│                  │
   │                  │                │<──[cursos]────│                  │
   │                  │<──[curso]──────│               │                  │
   │                  │                │               │                  │
   │                  │─validar_cupos─>│               │                  │
   │                  │                │─GET /cursos/ID>                  │
   │                  │                │<──[curso]─────│                  │
   │                  │<──[validación]─│               │                  │
   │                  │                │               │                  │
   │                  │─crear_inscr───>│               │                  │
   │                  │                │───POST ───────────────────────>  │
   │                  │                │               │  inscripciones   │
   │                  │                │               │<─RabbitMQ────────│
   │                  │                │               │  validar_curso   │
   │                  │                │               │                  │
   │                  │                │               │──reservar_cupo──>│
   │                  │                │               │<─OK──────────────│
   │                  │                │               │                  │
   │                  │                │<──[inscripción]──────────────────│
   │                  │<──[resultado]──│               │                  │
   │                  │                │               │                  │
   │<── Response ─────│                │               │                  │
   │    success:true  │                │               │                  │
```

---

## 🚀 Cómo Ejecutar

### Prerrequisitos

- **Node.js** 20+
- **Docker Desktop** corriendo
- **PowerShell** 7+ (Windows)
- Puerto 3000, 3001, 3002 disponibles

### Paso 1: Levantar Microservicios en Docker

```powershell
cd "C:\Users\Lenovo\Desktop\jj\Actividad 3"
docker-compose up -d postgres_curso postgres_inscripcion rabbitmq redis ms-curso ms-inscripcion
```

**Espera hasta que todos estén "Healthy"** (30-60 segundos)

Verifica:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Deberías ver:
```
postgres_curso        Up X minutes (healthy)
postgres_inscripcion  Up X minutes (healthy)
rabbitmq              Up X minutes (healthy)
redis                 Up X minutes (healthy)
ms-curso              Up X minutes (healthy)
ms-inscripcion        Up X minutes (healthy)
```

### Paso 2: Insertar Cursos de Prueba

```powershell
docker exec postgres_curso psql -U pguser -d curso_db -c "
INSERT INTO curso (id, nombre, descripcion, cupos_totales, cupos_ocupados) 
VALUES 
  ('5a5cd2fd-3e69-42ca-8088-0181bb1a0e5a', 'Programacion con Node.js', 'Curso completo de Node.js', 30, 0),
  ('ddd4541b-502f-454a-9b47-ee2c99fa3fb6', 'Desarrollo Web Full Stack', 'HTML CSS JavaScript', 25, 0)
ON CONFLICT DO NOTHING;
"
```

Verifica:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/cursos" -UseBasicParsing
```

### Paso 3: Iniciar API Gateway (Local)

Abre una terminal de PowerShell en `Actividad 3/api-gateway`:

```powershell
cd api-gateway

# Configurar variables de entorno
$env:DEMO_MODE="true"
$env:GEMINI_API_KEY="AIzaSyDTcJo1YrCDWZ3hjHvPewPyOzK41QGH2SY"
$env:BACKEND_URL="http://localhost:3001"
$env:INSCRIPCION_URL="http://localhost:3002"

# Iniciar
npm start
```

Espera hasta ver:
```
[MCP Client] ✅ Conectado exitosamente
[MCP Client] 📋 Tools disponibles: buscar_curso, validar_cupos, crear_inscripcion
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Inscripción Exitosa

**Petición:**
```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/inscripcion/process" `
  -Method POST `
  -Body '{"message": "Quiero inscribirme al curso de Node.js con el estudiante ID 1"}' `
  -ContentType "application/json" `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Respuesta:**
```json
{
  "success": true,
  "response": "✅ ¡Inscripción exitosa!\n\n📚 **Curso:** Programacion con Node.js\n👤 **Estudiante ID:** 1\n📅 **Fecha:** 2026-01-08T21:33:55.232Z\n🎫 **ID Inscripción:** 3dd50b41-f1e0-4e9d-9c06-1acf6954e0d2\n\nEl curso tiene 29 cupos disponibles restantes.",
  "timestamp": "2026-01-08T21:33:55.255Z"
}
```

**Lo que ocurrió internamente:**
1. ✅ Buscó "Node.js" → Encontró "Programacion con Node.js"
2. ✅ Validó cupos → 30 disponibles
3. ✅ Creó inscripción → Estudiante 1 inscrito
4. ✅ Actualizó cupos → Quedan 29

---

### Ejemplo 2: Inscribir Múltiples Estudiantes

```powershell
# Estudiante 2
Invoke-WebRequest -Uri "http://localhost:3000/inscripcion/process" -Method POST `
  -Body '{"message": "Inscribir estudiante ID 2 en curso de Node.js"}' `
  -ContentType "application/json" -UseBasicParsing

# Estudiante 3
Invoke-WebRequest -Uri "http://localhost:3000/inscripcion/process" -Method POST `
  -Body '{"message": "Quiero inscribirme al curso de Node.js con el estudiante ID 3"}' `
  -ContentType "application/json" -UseBasicParsing
```

**Resultado:** 3 estudiantes inscritos, quedan 27 cupos

---

### Ejemplo 3: Ver Formato Bonito (Opcional)

```powershell
Invoke-WebRequest ... | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Salida formateada:**
```json
{
  "success": true,
  "response": "✅ ¡Inscripción exitosa!\n\n📚 **Curso:** Programacion con Node.js\n👤 **Estudiante ID:** 1\n📅 **Fecha:** 2026-01-08T21:33:55.232Z\n🎫 **ID Inscripción:** 3dd50b41-f1e0-4e9d-9c06-1acf6954e0d2\n\nEl curso tiene 29 cupos disponibles restantes.",
  "timestamp": "2026-01-08T21:33:55.255Z"
}
```

---

### Ejemplo 4: Verificar Inscripciones en Base de Datos

```powershell
docker exec postgres_inscripcion psql -U pguser -d inscripcion_db -c "
SELECT 
  LEFT(id::text, 8) as id,
  LEFT(curso_id::text, 8) as curso,
  estudiante_nombre,
  status,
  created_at::date
FROM inscripcion
ORDER BY created_at DESC
LIMIT 5;
"
```

**Resultado:**
```
   id    |  curso   | estudiante_nombre |  status   | created_at
---------+----------+-------------------+-----------+------------
 3dd50b41 | 5a5cd2fd |         3         | CONFIRMED | 2026-01-08
 2859140d | 5a5cd2fd |         2         | CONFIRMED | 2026-01-08
 924e5d86 | 5a5cd2fd |         1         | CONFIRMED | 2026-01-08
```

---

## 🧪 Verificar que Todo Funciona

### Healthcheck API Gateway

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/inscripcion/health" -UseBasicParsing
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "model": "gemini-2.0-flash-exp (DEMO MODE)",
  "tools": 3
}
```

### Verificar Microservicios

```powershell
# ms-curso
Invoke-WebRequest -Uri "http://localhost:3001/cursos" -UseBasicParsing

# ms-inscripcion
Invoke-WebRequest -Uri "http://localhost:3002/inscripciones" -UseBasicParsing
```

### Ver Logs en Tiempo Real

```powershell
# API Gateway (en la terminal donde corre npm start)

# ms-curso
docker logs -f ms-curso

# ms-inscripcion
docker logs -f ms-inscripcion
```

---

## 📊 Tecnologías Utilizadas

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| API Gateway | NestJS 10 + TypeScript | 3000 |
| MCP Server | Node.js 20 + @modelcontextprotocol/sdk | stdio |
| IA | Google Gemini 2.0 Flash (o modo DEMO) | - |
| ms-curso | NestJS 10 + TypeORM + PostgreSQL | 3001 |
| ms-inscripcion | NestJS 10 + TypeORM + PostgreSQL | 3002 |
| Mensajería | RabbitMQ 3.11 | 5672 |
| Caché | Redis 7 | 6379 |
| Base de Datos | PostgreSQL 17 | 5433, 5434 |
| Orquestación | Docker Compose | - |

---

## 🎯 Características Principales

✅ **Procesamiento de Lenguaje Natural** - El usuario habla en español coloquial  
✅ **Orquestación Automática** - La IA decide qué tools usar y en qué orden  
✅ **Modo DEMO** - Funciona sin API Key de Gemini para testing  
✅ **Protocolo MCP** - Estándar abierto para LLM-Tool interaction  
✅ **Arquitectura de Microservicios** - Escalable y mantenible  
✅ **Idempotencia** - Redis + PostgreSQL previenen duplicados  
✅ **Validación Robusta** - Verifica cupos antes de inscribir  
✅ **Mensajería Asíncrona** - RabbitMQ para comunicación entre servicios  
✅ **Healthchecks** - Todos los servicios monitoreados  
✅ **TypeScript Strict** - Type safety en todo el código

---

## 🐛 Troubleshooting

### Error: "Puerto 3000 ocupado"

**Causa:** Ya hay un proceso corriendo en ese puerto  
**Solución:**
```powershell
# Detener API Gateway en Docker
docker stop api-gateway

# O matar proceso en puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "database 'pguser' does not exist"

**Causa:** TypeORM no lee DATABASE_NAME correctamente  
**Solución:** Ya corregido en `app.module.ts`, rebuildeá las imágenes:
```powershell
docker-compose build ms-curso ms-inscripcion
docker-compose up -d ms-curso ms-inscripcion
```

### Error: "MCP Server not found"

**Causa:** Path incorrecto al servidor MCP  
**Solución:** Verificar que exista:
```powershell
Test-Path ".\mcp-server\dist\server.js"
```

Si no existe:
```powershell
cd mcp-server
npm run build
```

### Inscripciones no se crean

**Causa:** ms-inscripcion no puede comunicarse con ms-curso  
**Solución:** Verificar red de Docker:
```powershell
docker network inspect actividad3_default
```

---

## 📝 Notas Importantes

1. **Modo DEMO vs Gemini Real:**  
   - `DEMO_MODE=true` → Simula IA localmente (no requiere API key)
   - `DEMO_MODE=false` → Usa Gemini AI real (requiere `GEMINI_API_KEY`)

2. **API Gateway en Docker vs Local:**  
   - **Local** (recomendado desarrollo): logs en vivo, fácil debug
   - **Docker** (producción): todo containerizado, escalable

3. **Cupos Disponibles:**  
   - Se calculan dinámicamente: `cupos_totales - cupos_ocupados`
   - Se actualizan automáticamente con cada inscripción
   - Validación antes de inscribir previene sobrecupos

4. **Idempotencia:**  
   - Redis (ms-curso, ms-inscripcion): TTL 5 minutos
   - PostgreSQL (inscripcion): `message_id` único
   - Previene inscripciones duplicadas

---

## 🎓 Conclusión

Este sistema demuestra cómo integrar **IA generativa** con **arquitectura de microservicios** usando el **Model Context Protocol**. La IA no solo genera texto, sino que **ejecuta acciones reales** en sistemas de producción de forma segura y estructurada.

**Ventajas:**
- Usuario no necesita conocer la estructura del sistema
- IA maneja la complejidad de orquestación
- Tools reutilizables por otros LLMs que soporten MCP
- Escalable a cientos de tools diferentes

**Casos de Uso Reales:**
- Asistentes virtuales para gestión académica
- Chatbots con acciones en backend
- Automatización de procesos empresariales
- Integración de IA en sistemas legacy

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs: `docker logs <contenedor>`
2. Verificar healthchecks: `docker ps`
3. Probar endpoints manualmente con `Invoke-WebRequest`
4. Consultar [documentación de MCP](https://modelcontextprotocol.io/)

---

**Desarrollado para Taller 3 - Integración de IA y Microservicios**  
Universidad / Curso de Arquitectura de Software  
Enero 2026
