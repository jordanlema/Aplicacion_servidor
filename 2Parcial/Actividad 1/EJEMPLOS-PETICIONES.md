# 🧪 EJEMPLOS DE PETICIONES - Testing Manual

## 📝 Colección de Peticiones para Postman/Insomnia

### Base URL
```
http://localhost:3000
```

---

## 1️⃣ Crear Curso

### Request
```http
POST http://localhost:3000/cursos
Content-Type: application/json

{
  "nombre": "Programación Web Avanzada",
  "descripcion": "Curso de NestJS, React y microservicios",
  "cupos_totales": 10
}
```

### Response Esperada
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

**📋 Acción:** Copia el `curso_id` de los logs de `ms-curso` para usarlo en las siguientes peticiones.

---

## 2️⃣ Crear Inscripción (Primera Vez)

### Request
```http
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "PEGAR_CURSO_ID_AQUI",
  "estudiante_nombre": "Juan Pérez",
  "estudiante_email": "juan.perez@universidad.edu",
  "idempotency_key": "test-inscripcion-001"
}
```

### Response Esperada
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "isNew": true,
  "inscripcion": {
    "id": "a1b2c3d4-5678-90ab-cdef-123456789abc",
    "curso_id": "...",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "status": "CONFIRMED",
    "message_id": "test-inscripcion-001",
    "created_at": "2025-12-09T..."
  },
  "idempotency_key": "test-inscripcion-001"
}
```

**✅ Verificar:**
- `isNew: true` (es una inscripción nueva)
- `status: "CONFIRMED"`
- En logs de `ms-curso`: "✅ Cupo reservado"

---

## 3️⃣ Duplicar Inscripción (Prueba de Idempotencia)

### Request - EXACTAMENTE LA MISMA
```http
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "MISMO_CURSO_ID",
  "estudiante_nombre": "Juan Pérez",
  "estudiante_email": "juan.perez@universidad.edu",
  "idempotency_key": "test-inscripcion-001"
}
```

### Response Esperada
```json
{
  "success": true,
  "message": "Inscripción ya existía (idempotencia)",
  "isNew": false,
  "inscripcion": {
    "id": "a1b2c3d4-5678-90ab-cdef-123456789abc",  ← MISMO ID
    "curso_id": "...",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan.perez@universidad.edu",
    "status": "CONFIRMED",
    "message_id": "test-inscripcion-001",
    "created_at": "2025-12-09T..."
  },
  "idempotency_key": "test-inscripcion-001"
}
```

**✅ Verificar:**
- `isNew: false` ← **IDEMPOTENCIA DETECTADA**
- Mismo `id` de inscripción
- En logs de `ms-inscripcion`: "⚠️ IDEMPOTENCIA: Esta inscripción ya fue procesada"
- En logs de `ms-curso`: NO hay segundo log de "Cupo reservado"

---

## 4️⃣ Crear Otra Inscripción (Diferente Key)

### Request
```http
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "MISMO_CURSO_ID",
  "estudiante_nombre": "María López",
  "estudiante_email": "maria.lopez@universidad.edu",
  "idempotency_key": "test-inscripcion-002"
}
```

### Response Esperada
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "isNew": true,  ← NUEVA INSCRIPCIÓN
  "inscripcion": {
    "id": "diferente-id-xyz",  ← ID DIFERENTE
    "curso_id": "...",
    "estudiante_nombre": "María López",
    ...
  }
}
```

**✅ Verificar:**
- `isNew: true` (key diferente = inscripción nueva)
- ID diferente al anterior
- En logs de `ms-curso`: "Cupos: 2/10" (segundo cupo reservado)

---

## 5️⃣ Listar Inscripciones

### Request
```http
GET http://localhost:3000/inscripciones
```

### Response Esperada
```json
{
  "total": 2,
  "inscripciones": [
    {
      "id": "a1b2c3d4-...",
      "curso_id": "...",
      "estudiante_nombre": "Juan Pérez",
      "estudiante_email": "juan.perez@universidad.edu",
      "status": "CONFIRMED",
      "message_id": "test-inscripcion-001",
      "created_at": "..."
    },
    {
      "id": "diferente-id-xyz",
      "curso_id": "...",
      "estudiante_nombre": "María López",
      "estudiante_email": "maria.lopez@universidad.edu",
      "status": "CONFIRMED",
      "message_id": "test-inscripcion-002",
      "created_at": "..."
    }
  ]
}
```

---

## 6️⃣ Prueba con Header de Idempotencia

### Request
```http
POST http://localhost:3000/inscripciones
Content-Type: application/json
Idempotency-Key: mi-key-personalizada-123

{
  "curso_id": "CURSO_ID",
  "estudiante_nombre": "Carlos Ruiz",
  "estudiante_email": "carlos.ruiz@universidad.edu"
}
```

**📝 Nota:** El `idempotency_key` también puede enviarse como header HTTP.

---

## 🧪 Escenarios de Prueba

### Escenario 1: Prueba Básica
```
1. Crear curso → Copiar ID
2. Crear inscripción con key "test-001"
3. Verificar: isNew = true
```

### Escenario 2: Prueba de Idempotencia
```
1. Crear inscripción con key "test-002"
2. Enviar MISMA petición con MISMO key "test-002"
3. Verificar: 
   - isNew = false
   - Mismo ID de inscripción
   - Logs muestran "DUPLICADO detectado"
```

### Escenario 3: Múltiples Inscripciones
```
1. Crear 3 inscripciones con keys diferentes
2. Duplicar la segunda inscripción
3. Verificar:
   - Total = 3 inscripciones (no 4)
   - Cupos ocupados = 3 (no 4)
```

### Escenario 4: Sin Idempotency Key
```
1. Crear inscripción SIN idempotency_key
2. Sistema genera UUID automáticamente
3. Verificar: Response incluye el key generado
```

---

## 📊 Logs Esperados

### Logs de ms-inscripcion

#### Primera Inscripción
```
🌐 POST /inscripciones recibido

🔵 Iniciando creación de inscripción...
   Message ID: test-inscripcion-001
   Curso: abc-123
   Estudiante: Juan Pérez

🆕 Mensaje nuevo - Procesando inscripción...
✅ Inscripción creada en BD: inscripcion-id-456
📤 Enviando reserva de cupo a ms-curso...
✅ Inscripción CONFIRMADA
```

#### Inscripción Duplicada
```
🌐 POST /inscripciones recibido

🔵 Iniciando creación de inscripción...
   Message ID: test-inscripcion-001

⚠️  IDEMPOTENCIA: Esta inscripción ya fue procesada
   ✅ Retornando inscripción existente: inscripcion-id-456
```

### Logs de ms-curso

#### Primera Reserva
```
📥 [course.reserveSpot] Mensaje recibido
   Message ID: reserve-test-001
   Curso ID: abc-123

🆕 Mensaje nuevo - Procesando reserva de cupo...
✅ Cupo reservado en curso "Programación Web". Cupos: 1/10
```

#### Mensaje Duplicado (NO debería aparecer en duplicados)
```
(No hay segundo log de reserva porque ms-inscripcion 
no envía segundo mensaje a ms-curso gracias a la idempotencia)
```

---

## 🔍 Verificación en Base de Datos

### Consultar cursos (PostgreSQL)
```sql
-- Conectar a la BD
docker exec -it <container-postgres-curso> psql -U pguser -d curso_db

-- Ver cursos
SELECT id, nombre, cupos_totales, cupos_ocupados FROM curso;
```

### Consultar inscripciones
```sql
-- Conectar a la BD
docker exec -it <container-postgres-inscripcion> psql -U pguser -d inscripcion_db

-- Ver inscripciones
SELECT id, curso_id, estudiante_nombre, status, message_id FROM inscripcion;
```

### Consultar Redis
```bash
# Conectar a Redis
docker exec -it <container-redis> redis-cli

# Ver todas las keys
KEYS *

# Ver valor de una key específica
GET inscripcion:test-inscripcion-001

# Ver TTL (tiempo restante)
TTL inscripcion:test-inscripcion-001
```

---

## ⚠️ Casos de Error

### Error: Curso no encontrado
```http
POST /inscripciones

{
  "curso_id": "id-inexistente",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "error": "Curso no encontrado"
}
```

### Error: Sin cupos disponibles
```http
POST /inscripciones

{
  "curso_id": "curso-lleno",
  ...
}
```

**Logs de ms-curso:**
```
❌ Reserva fallida: Sin cupos disponibles
```

---

## 📋 Checklist de Pruebas

- [ ] Crear curso exitosamente
- [ ] Crear primera inscripción (isNew = true)
- [ ] Duplicar inscripción (isNew = false, mismo ID)
- [ ] Verificar logs muestran "DUPLICADO detectado"
- [ ] Crear segunda inscripción con diferente key
- [ ] Listar inscripciones (total correcto)
- [ ] Verificar cupos_ocupados en BD
- [ ] Verificar keys en Redis
- [ ] Probar sin idempotency_key (genera automático)
- [ ] Probar con header Idempotency-Key

---

## 💡 Tips para la Demostración

1. **Tener Postman/Insomnia abierto** con las peticiones preparadas
2. **Tener logs visibles** en otra pantalla: `docker-compose logs -f`
3. **Preparar IDs de cursos** antes de la demo (seed-data.ps1)
4. **Demostrar el flujo completo**:
   - Crear curso
   - Primera inscripción → Mostrar logs
   - Duplicar → Mostrar "DUPLICADO detectado" en logs
   - Comparar responses (mismo ID, isNew false)
