# ⚡ COMANDOS RÁPIDOS

## 🚀 Inicio Rápido (3 comandos)

```powershell
# 1. Instalar dependencias
.\install-deps.ps1

# 2. Levantar todo
docker-compose up --build

# 3. Crear cursos de prueba (en otra terminal)
.\seed-data.ps1
```

---

## 🐳 Docker

```powershell
# Levantar servicios
docker-compose up

# Levantar en background
docker-compose up -d

# Reconstruir imágenes
docker-compose up --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f ms-curso
docker-compose logs -f ms-inscripcion

# Detener todo
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Ver estado de servicios
docker-compose ps
```

---

## 📦 NPM (Desarrollo Local)

```powershell
# Instalar todas las dependencias
.\install-deps.ps1

# O manualmente:
cd ms-curso
npm install
cd ../ms-inscripcion
npm install
cd ../ms-gateway
npm install
cd ..

# Ejecutar en modo desarrollo (sin Docker)
cd ms-curso
npm run start:dev

cd ms-inscripcion
npm run start:dev

cd ms-gateway
npm run start:dev
```

---

## 🧪 Pruebas

```powershell
# Crear datos de prueba
.\seed-data.ps1

# Prueba automatizada de idempotencia
.\test-idempotencia.ps1

# Prueba manual con curl (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/cursos" -Method POST `
  -Body '{"nombre":"Test","descripcion":"Test","cupos_totales":5}' `
  -ContentType "application/json"
```

---

## 🔍 Verificación

```powershell
# Verificar que todo está corriendo
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs

# Verificar RabbitMQ
# http://localhost:15672 (guest/guest)

# Verificar Redis
docker exec -it <redis-container> redis-cli
KEYS *
GET inscripcion:test-key-123

# Verificar PostgreSQL - Cursos
docker exec -it <postgres-curso-container> psql -U pguser -d curso_db
SELECT * FROM curso;

# Verificar PostgreSQL - Inscripciones
docker exec -it <postgres-inscripcion-container> psql -U pguser -d inscripcion_db
SELECT * FROM inscripcion;
```

---

## 🔧 Troubleshooting

```powershell
# Reiniciar un servicio específico
docker-compose restart ms-curso

# Ver logs de errores
docker-compose logs | Select-String "error" -CaseSensitive

# Limpiar todo y empezar de cero
docker-compose down -v
docker system prune -f
docker-compose up --build

# Verificar puertos en uso
netstat -ano | findstr "3000 3001 3002 5672 6379"

# Matar proceso en puerto específico
Stop-Process -Id <PID> -Force
```

---

## 📊 Endpoints Principales

```powershell
# Gateway
$BASE = "http://localhost:3000"

# Crear curso
Invoke-RestMethod "$BASE/cursos" -Method POST -Body '{"nombre":"Test","descripcion":"Test","cupos_totales":5}' -ContentType "application/json"

# Crear inscripción
Invoke-RestMethod "$BASE/inscripciones" -Method POST -Body '{"curso_id":"ID","estudiante_nombre":"Juan","estudiante_email":"j@test.com","idempotency_key":"test-1"}' -ContentType "application/json"

# Listar inscripciones
Invoke-RestMethod "$BASE/inscripciones"
```

---

## 🎯 Para la Demostración

```powershell
# Terminal 1: Logs
docker-compose up

# Terminal 2: Pruebas
.\seed-data.ps1
# Copiar un curso_id de los logs

# En Postman/Insomnia:
# POST /inscripciones con idempotency_key
# Enviar 2 veces la MISMA petición
# Verificar: isNew = false en la segunda

# En Terminal 1 (logs):
# Buscar: "⚠️ Mensaje DUPLICADO detectado"
```

---

## 📝 Aliases Útiles (Opcional)

Agregar a tu perfil de PowerShell:

```powershell
# Abrir perfil
notepad $PROFILE

# Agregar:
function Start-Project { docker-compose up }
function Stop-Project { docker-compose down }
function Logs-Project { docker-compose logs -f }
function Seed-Data { .\seed-data.ps1 }
function Test-Idempotency { .\test-idempotencia.ps1 }

# Guardar y recargar
. $PROFILE

# Ahora puedes usar:
Start-Project
Logs-Project
Seed-Data
Test-Idempotency
```

---

## 🏁 Comando Todo-en-Uno

```powershell
# Script completo de inicio
.\install-deps.ps1; docker-compose up -d; Start-Sleep -Seconds 30; .\seed-data.ps1; docker-compose logs -f
```

Esto:
1. Instala dependencias
2. Levanta servicios en background
3. Espera 30 segundos
4. Crea datos de prueba
5. Muestra logs en tiempo real
