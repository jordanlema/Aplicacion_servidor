# Backend REST API con NestJS

Este proyecto es una API REST desarrollada con NestJS que implementa un sistema de gestión académica. La aplicación permite gestionar cursos, actividades, certificados, profesores, usuarios y más.

## Características Principales

- Framework: NestJS v11
- Base de datos: PostgreSQL con TypeORM
- Validación de datos con class-validator y class-transformer
- Arquitectura modular y escalable
- Implementación de DTOs (Data Transfer Objects)
- Sistema de entidades relacionales

## Estructura del Proyecto

```
src/
├── activities/         # Módulo de actividades
├── certificates/       # Módulo de certificados
├── courses/           # Módulo de cursos
├── professors/        # Módulo de profesores
├── questions/         # Módulo de preguntas
├── users/            # Módulo de usuarios
└── main.ts           # Punto de entrada de la aplicación
```

## Módulos Implementados

### 1. Actividades (Activities)
- Gestión de actividades académicas
- CRUD completo de actividades
- Relaciones con cursos y usuarios

### 2. Certificados (Certificates)
- Sistema de emisión de certificados
- Validación de completitud de cursos
- Registro de certificaciones

### 3. Cursos (Courses)
- Administración de cursos
- Inscripción de estudiantes
- Gestión de contenido académico

### 4. Profesores (Professors)
- Gestión de profesores
- Asignación a cursos
- Control de permisos especiales

### 5. Preguntas (Questions)
- Sistema de evaluación
- Banco de preguntas
- Calificación automática

### 6. Usuarios (Users)
- Gestión de usuarios del sistema
- Roles y permisos
- Perfiles de estudiantes

## Configuración de Desarrollo

1. Instalación de dependencias:
```bash
npm install
```

2. Configuración de la base de datos:
   - Asegúrate de tener PostgreSQL instalado
   - Configura las credenciales de la base de datos

3. Iniciar el servidor en modo desarrollo:
```bash
npm run start:dev
```

## Scripts Disponibles

- `npm run build`: Compila el proyecto
- `npm run format`: Formatea el código usando Prettier
- `npm run start`: Inicia el servidor en modo producción
- `npm run start:dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm run lint`: Ejecuta el linter
- `npm run test`: Ejecuta las pruebas unitarias

## Características Técnicas

- Validación global de DTOs con transformación automática
- Whitelist y forbidNonWhitelisted para seguridad de datos
- Conversión implícita de tipos habilitada
- Puerto configurable mediante variables de entorno (default: 3000)

## Tecnologías Utilizadas

- NestJS v11
- TypeORM
- PostgreSQL
- class-validator
- class-transformer
- TypeScript
- Jest (para testing)
- ESLint + Prettier (para estilo de código)

## Autor

Jordan Lema

## Licencia

Este proyecto está bajo la Licencia UNLICENSED.
