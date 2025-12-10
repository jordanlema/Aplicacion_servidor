# 📁 ESTRUCTURA COMPLETA DEL PROYECTO

```
practicaweb-resilencia/
│
├── 📄 README.md                    # Documentación principal del proyecto
├── 📄 INICIO-RAPIDO.md            # Guía rápida de inicio
├── 📄 EXPLICACION-PATRON.md       # Explicación detallada del patrón Idempotent Consumer
├── 📄 RESUMEN.md                  # Resumen de todo lo implementado
├── 📄 EJEMPLOS-PETICIONES.md      # Ejemplos de peticiones HTTP para testing
├── 📄 COMANDOS.md                 # Comandos útiles de Docker, npm, etc.
├── 📄 ESTRUCTURA.md               # Este archivo
├── 📄 .gitignore                  # Archivos ignorados por Git
│
├── 🐳 docker-compose.yml          # Orquestación de servicios Docker
│
├── 📜 install-deps.ps1            # Script para instalar dependencias
├── 📜 seed-data.ps1               # Script para crear cursos de prueba
├── 📜 test-idempotencia.ps1       # Script de prueba automatizada
│
├── 📦 ms-curso/                   # Microservicio de CURSO (Entidad Maestra)
│   ├── 📂 src/
│   │   ├── 📂 animal/
│   │   │   ├── animal.entity.ts        → Entidad Curso
│   │   │   ├── animal.service.ts       → CursoService (validación, reserva)
│   │   │   └── animal.consumert.ts     → CursoConsumer (RabbitMQ)
│   │   ├── 📂 redis/
│   │   │   └── redis.service.ts        → RedisService (Idempotencia)
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── 📂 test/
│   ├── 🐳 Dockerfile
│   ├── 📄 package.json              → Dependencias (ioredis agregado)
│   ├── 📄 tsconfig.json
│   ├── 📄 nest-cli.json
│   └── 📄 README.md
│
├── 📦 ms-inscripcion/             # Microservicio de INSCRIPCIÓN (Entidad Transaccional)
│   ├── 📂 src/
│   │   ├── 📂 adoption/
│   │   │   ├── adoption.entity.ts      → Entidad Inscripcion
│   │   │   ├── adoption.service.ts     → InscripcionService (con idempotencia)
│   │   │   └── adoption.controller.ts  → InscripcionController (REST)
│   │   ├── 📂 redis/
│   │   │   └── redis.service.ts        → RedisService (Idempotencia)
│   │   ├── 📂 idempotency/             (archivos antiguos, no se usan)
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── 📂 test/
│   ├── 🐳 Dockerfile
│   ├── 📄 package.json              → Dependencias (ioredis, uuid agregados)
│   ├── 📄 tsconfig.json
│   ├── 📄 nest-cli.json
│   └── 📄 README.md
│
└── 📦 ms-gateway/                 # API Gateway (Punto de entrada HTTP)
    ├── 📂 src/
    │   ├── 📂 animal/
    │   │   ├── animal.controller.ts    → CursoController
    │   │   └── animal.module.ts        → CursoModule
    │   ├── 📂 adoption/
    │   │   ├── adoption.controller.ts  → InscripcionController
    │   │   └── adoption.module.ts      → InscripcionModule
    │   ├── app.module.ts
    │   ├── app.controller.ts
    │   ├── app.service.ts
    │   └── main.ts
    ├── 📂 test/
    ├── 🐳 Dockerfile
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    ├── 📄 nest-cli.json
    └── 📄 README.md
```

---

## 🔑 Archivos Clave

### Implementación del Patrón

| Archivo | Descripción |
|---------|-------------|
| `ms-curso/src/redis/redis.service.ts` | Servicio de Redis con `tryRegisterMessage()` (SET NX) |
| `ms-inscripcion/src/redis/redis.service.ts` | Servicio de Redis para ms-inscripcion |
| `ms-curso/src/animal/animal.consumert.ts` | Consumer con verificación de idempotencia |
| `ms-inscripcion/src/adoption/adoption.service.ts` | Lógica de inscripción con idempotencia completa |

### Entidades

| Archivo | Entidad | Tipo |
|---------|---------|------|
| `ms-curso/src/animal/animal.entity.ts` | **Curso** | Maestra |
| `ms-inscripcion/src/adoption/adoption.entity.ts` | **Inscripcion** | Transaccional |

### Infraestructura

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Define 7 servicios: rabbitmq, redis, 2 postgres, 3 microservicios |
| `ms-*/Dockerfile` | Imagen Docker de cada microservicio |

### Documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Documentación completa (arquitectura, instalación, pruebas) |
| `INICIO-RAPIDO.md` | Pasos rápidos para levantar el proyecto |
| `EXPLICACION-PATRON.md` | Teoría del Idempotent Consumer |
| `EJEMPLOS-PETICIONES.md` | Peticiones HTTP de prueba |
| `COMANDOS.md` | Comandos Docker, npm, verificación |
| `RESUMEN.md` | Resumen de todo lo implementado |

### Scripts

| Script | Función |
|--------|---------|
| `install-deps.ps1` | Instala npm packages en los 3 microservicios |
| `seed-data.ps1` | Crea 3 cursos de prueba |
| `test-idempotencia.ps1` | Prueba automatizada que demuestra idempotencia |

---

## 📊 Estadísticas del Proyecto

- **Microservicios**: 3 (ms-curso, ms-inscripcion, ms-gateway)
- **Bases de datos**: 2 PostgreSQL
- **Cache**: 1 Redis
- **Message Broker**: 1 RabbitMQ
- **Entidades**: 2 (Curso, Inscripcion)
- **Patrón de Resiliencia**: Idempotent Consumer
- **Archivos de documentación**: 7
- **Scripts de ayuda**: 3
- **Dockerfiles**: 3

---

## 🎯 Flujo de Archivos en una Petición

```
1. Cliente
   ↓
2. ms-gateway/src/adoption/adoption.controller.ts
   → POST /inscripciones
   ↓
3. ms-adoption/src/adoption/adoption.controller.ts
   → InscripcionController
   ↓
4. ms-adoption/src/adoption/adoption.service.ts
   → InscripcionService.createInscripcion()
   ├─→ ms-adoption/src/redis/redis.service.ts
   │   → Verificar/Registrar en Redis
   └─→ RabbitMQ: course.reserveSpot
   ↓
5. ms-animal/src/animal/animal.consumert.ts
   → CursoConsumer escucha evento
   ↓
6. ms-animal/src/redis/redis.service.ts
   → Verificar idempotencia
   ↓
7. ms-animal/src/animal/animal.service.ts
   → CursoService.reserveSpot()
   ↓
8. PostgreSQL (curso_db)
   → Actualiza cupos_ocupados
```

---

## 🔍 Mapeo de Nombres (Antiguo → Nuevo)

| Carpeta | Entidad | Propósito |
|---------|---------|--------|
| `ms-curso/` | Curso | Microservicio de entidad maestra |
| `ms-inscripcion/` | Inscripcion | Microservicio transaccional |

**Nota:** Las carpetas internas (`animal/`, `adoption/`) se mantienen por compatibilidad con la estructura de NestJS, pero contienen el código de Curso e Inscripción respectivamente.

| Clase Interna | Entidad |
|---------------|----------|
| `Animal` → | `Curso` |
| `AnimalService` → | `CursoService` |
| `Adoption` | `Inscripcion` | Entidad transaccional |
| `AdoptionService` | `InscripcionService` | Servicio de negocio |
| `AdoptionController` | `InscripcionController` | Controller REST |

**Nota:** Los nombres de carpetas siguen siendo `ms-animal` y `ms-adoption` por compatibilidad, pero el código interno usa la terminología de Curso e Inscripción.

---

## ✅ Archivos Listos para Entregar

### Código Fuente
- [x] `ms-animal/` (ms-curso)
- [x] `ms-adoption/` (ms-inscripcion)
- [x] `ms-gateway/`
- [x] `docker-compose.yml`

### Documentación
- [x] `README.md`
- [x] `INICIO-RAPIDO.md`
- [x] `EXPLICACION-PATRON.md`
- [x] `RESUMEN.md`
- [x] `EJEMPLOS-PETICIONES.md`
- [x] `COMANDOS.md`
- [x] `ESTRUCTURA.md`

### Scripts
- [x] `install-deps.ps1`
- [x] `seed-data.ps1`
- [x] `test-idempotencia.ps1`

### Configuración
- [x] `.gitignore`
- [x] Dockerfiles (3)
- [x] package.json (3)

---

## 🚀 Total de Archivos Creados/Modificados

- **Archivos TypeScript**: ~15
- **Archivos de configuración**: ~10
- **Archivos de documentación**: 7
- **Scripts PowerShell**: 3
- **Dockerfiles**: 3
- **docker-compose.yml**: 1

**Total**: ~39 archivos

---

Este proyecto está **completo y listo para presentar** ✅
