# 🎓 Sistema de Inscripciones - Índice de Documentación

## 🚀 ¡Empieza aquí!

Si es tu primera vez con este proyecto, sigue este orden:

### 1️⃣ **Lectura Rápida** (5 minutos)
- 📄 [INICIO-RAPIDO.md](INICIO-RAPIDO.md) - Comandos esenciales para levantar el proyecto

### 2️⃣ **Entender el Proyecto** (10 minutos)
- 📘 [README.md](README.md) - Documentación completa
  - Arquitectura
  - Tecnologías
  - Instalación
  - Pruebas
  - Troubleshooting

### 3️⃣ **Entender el Patrón** (15 minutos)
- 📗 [EXPLICACION-PATRON.md](EXPLICACION-PATRON.md) - Explicación técnica del Idempotent Consumer
  - ¿Qué es idempotencia?
  - ¿Por qué lo necesitamos?
  - Implementación con Redis
  - Casos de uso cubiertos

### 4️⃣ **Ejecutar y Probar** (20 minutos)
- 🧪 [EJEMPLOS-PETICIONES.md](EJEMPLOS-PETICIONES.md) - Peticiones de prueba
- 📜 Scripts de prueba:
  - `install-deps.ps1` - Instalar dependencias
  - `seed-data.ps1` - Crear datos de prueba
  - `test-idempotencia.ps1` - Demostración automatizada

### 5️⃣ **Referencias Rápidas**
- ⚡ [COMANDOS.md](COMANDOS.md) - Comandos Docker, npm, verificación
- 📂 [ESTRUCTURA.md](ESTRUCTURA.md) - Estructura completa del proyecto
- 📋 [RESUMEN.md](RESUMEN.md) - Resumen de todo lo implementado

---

## 🎯 Guías por Objetivo

### Si quieres... → Lee esto

| Objetivo | Documentos |
|----------|------------|
| **Levantar el proyecto rápido** | [INICIO-RAPIDO.md](INICIO-RAPIDO.md) |
| **Entender la arquitectura** | [README.md](README.md) → Sección "Arquitectura" |
| **Entender el patrón** | [EXPLICACION-PATRON.md](EXPLICACION-PATRON.md) |
| **Hacer pruebas manuales** | [EJEMPLOS-PETICIONES.md](EJEMPLOS-PETICIONES.md) |
| **Ver comandos útiles** | [COMANDOS.md](COMANDOS.md) |
| **Preparar presentación** | [README.md](README.md) → Sección "Notas para la Presentación" |
| **Resolver errores** | [README.md](README.md) → Sección "Troubleshooting" |
| **Ver estructura de archivos** | [ESTRUCTURA.md](ESTRUCTURA.md) |
| **Resumen ejecutivo** | [RESUMEN.md](RESUMEN.md) |

---

## 📦 Archivos del Proyecto

### 📚 Documentación
```
README.md                   - Documentación principal (completa)
INICIO-RAPIDO.md           - Guía de inicio rápido
EXPLICACION-PATRON.md      - Teoría del Idempotent Consumer
RESUMEN.md                 - Resumen de implementación
EJEMPLOS-PETICIONES.md     - Peticiones HTTP de prueba
COMANDOS.md                - Comandos útiles
ESTRUCTURA.md              - Estructura del proyecto
INDEX.md                   - Este archivo
```

### 🐳 Infraestructura
```
docker-compose.yml         - Orquestación de servicios
.gitignore                 - Archivos ignorados
```

### 📜 Scripts
```
install-deps.ps1          - Instalar dependencias npm
seed-data.ps1             - Crear cursos de prueba
test-idempotencia.ps1     - Prueba automatizada
```

### 📦 Microservicios
```
ms-animal/                - Microservicio de Curso (Maestra)
ms-adoption/              - Microservicio de Inscripción (Transaccional)
ms-gateway/               - API Gateway
```

---

## ⚡ Inicio Súper Rápido (3 comandos)

```powershell
# 1. Instalar
.\install-deps.ps1

# 2. Levantar
docker-compose up --build

# 3. Probar (en otra terminal)
.\seed-data.ps1
```

Luego abre Postman y sigue [EJEMPLOS-PETICIONES.md](EJEMPLOS-PETICIONES.md)

---

## 🎓 Para la Presentación en Clase

### Orden Sugerido de Explicación

1. **Problema** (2 min)
   - Mensajes duplicados en sistemas distribuidos
   - Sin idempotencia: doble procesamiento

2. **Solución** (3 min)
   - Patrón: Idempotent Consumer
   - Tecnología: Redis con SET NX (operación atómica)
   - Flujo: Verificar → Registrar → Procesar

3. **Arquitectura** (3 min)
   - Mostrar diagrama del README
   - 3 microservicios
   - RabbitMQ para comunicación asíncrona
   - Redis para deduplicación

4. **Demostración** (7 min)
   - Levantar: `docker-compose up`
   - Crear curso: `seed-data.ps1`
   - Primera inscripción (Postman)
   - Duplicar mensaje (misma petición)
   - Mostrar logs: "DUPLICADO detectado"
   - Verificar: Solo 1 cupo reservado

5. **Código Clave** (5 min)
   - Mostrar `RedisService.tryRegisterMessage()`
   - Mostrar consumer con verificación de idempotencia
   - Explicar SET NX

### Archivos a Tener Abiertos
- Postman con peticiones preparadas
- Terminal con logs: `docker-compose logs -f`
- Editor de código con:
  - `ms-animal/src/redis/redis.service.ts`
  - `ms-animal/src/animal/animal.consumert.ts`
  - `ms-adoption/src/adoption/adoption.service.ts`

### Puntos Clave a Mencionar
✅ Entidades: Curso (Maestra) e Inscripción (Transaccional)  
✅ Patrón: Idempotent Consumer (el más fácil del taller)  
✅ Tecnología: Redis SET NX (operación atómica thread-safe)  
✅ Beneficio: Evita doble procesamiento de mensajes  
✅ Demostración: Mensaje duplicado detectado e ignorado  

---

## 🔗 Links Útiles

### Durante el Desarrollo
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- Gateway API: http://localhost:3000
- ms-curso: http://localhost:3001
- ms-inscripcion: http://localhost:3002

### Comandos de Verificación
```powershell
# Ver servicios corriendo
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar Redis
docker exec -it <redis-container> redis-cli
KEYS *

# Verificar BD
docker exec -it <postgres-container> psql -U pguser -d curso_db
```

---

## ✅ Checklist Pre-Entrega

- [ ] Código compila sin errores
- [ ] Docker Compose levanta sin problemas
- [ ] Scripts de prueba funcionan
- [ ] Documentación completa
- [ ] Prueba de idempotencia exitosa
- [ ] Logs muestran "DUPLICADO detectado"
- [ ] README claro y detallado

---

## 📞 Ayuda Rápida

### ❓ ¿El proyecto no levanta?
→ Ver [README.md](README.md) sección "Troubleshooting"

### ❓ ¿No entiendo cómo funciona la idempotencia?
→ Ver [EXPLICACION-PATRON.md](EXPLICACION-PATRON.md)

### ❓ ¿Cómo hago las pruebas?
→ Ver [EJEMPLOS-PETICIONES.md](EJEMPLOS-PETICIONES.md)

### ❓ ¿Qué comando necesito?
→ Ver [COMANDOS.md](COMANDOS.md)

### ❓ ¿Qué archivos modificar?
→ Ver [ESTRUCTURA.md](ESTRUCTURA.md)

---

## 🎯 Resumen de 30 Segundos

Este proyecto implementa el **patrón Idempotent Consumer** usando:
- **Entidades**: Curso (Maestra) e Inscripción (Transaccional)
- **Tecnología**: Redis con SET NX para deduplicación atómica
- **Arquitectura**: 3 microservicios comunicados por RabbitMQ
- **Beneficio**: Mensajes duplicados se detectan y se ignoran automáticamente

**Demostración**: Una inscripción enviada 2 veces solo reserva 1 cupo ✅

---

**¡Éxito con tu presentación!** 🎉
