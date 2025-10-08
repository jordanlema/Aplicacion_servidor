# Modelo de Datos - Sistema de Gestión de Cursos

## Entidades Implementadas ✅

### 1. **Usuario** (Base)
- id (int, PK)
- nombre (string)
- email (string)
- password (string)
- rol (string) - estudiante, profesor, admin

### 2. **Profesor**
- id (int, PK)
- usuarioId (int, FK → Usuario)
- experiencia (int)
- estado (string) - pendiente, aceptado, rechazado

### 3. **Curso**
- id (int, PK)
- titulo (string)
- descripcion (string)
- profesorId (int, FK → Profesor)
- **Relaciones:**
  - actividades[] (OneToMany → Actividad)
  - evaluaciones[] (OneToMany → Evaluacion)
  - inscripciones[] (OneToMany → InscripcionCurso)
  - certificados[] (OneToMany → Certificado)

### 4. **Actividad**
- id (int, PK)
- cursoId (int, FK → Curso)
- titulo (string)
- descripcion (string)
- **Relaciones:**
  - curso (ManyToOne → Curso)
  - entregas[] (OneToMany → EntregaActividad)

### 5. **Evaluacion**
- id (int, PK)
- cursoId (int, FK → Curso)
- puntajeRequerido (float)
- **Relaciones:**
  - curso (ManyToOne → Curso)
  - preguntas[] (OneToMany → EvaluacionPregunta)
  - resultados[] (OneToMany → ResultadoEvaluacion)

### 6. **Pregunta**
- id (int, PK)
- enunciado (string)
- respuestaCorrecta (string)

### 7. **EvaluacionPregunta** (Tabla de unión)
- id (int, PK)
- evaluacionId (int, FK → Evaluacion)
- preguntaId (int, FK → Pregunta)
- **Relaciones:**
  - evaluacion (ManyToOne → Evaluacion)
  - pregunta (ManyToOne → Pregunta)

### 8. **InscripcionCurso**
- id (int, PK)
- cursoId (int, FK → Curso)
- estudianteId (int, FK → Usuario)
- **Relaciones:**
  - curso (ManyToOne → Curso)

### 9. **Certificado**
- id (int, PK)
- cursoId (int, FK → Curso)
- estudianteId (int, FK → Usuario)
- fechaEmision (date)
- codigoVerificacion (string)
- **Relaciones:**
  - curso (ManyToOne → Curso)

### 10. **ResultadoEvaluacion**
- id (int, PK)
- evaluacionId (int, FK → Evaluacion)
- estudianteId (int, FK → Usuario)
- puntajeObtenido (float)
- **Relaciones:**
  - evaluacion (ManyToOne → Evaluacion)

### 11. **EntregaActividad**
- id (int, PK)
- actividadId (int, FK → Actividad)
- estudianteId (int, FK → Usuario)
- archivoURL (string)
- fechaEnvio (date)
- **Relaciones:**
  - actividad (ManyToOne → Actividad)

## Relaciones del Diagrama

```
Usuario (1) ----< Profesor (relación a través de usuarioId)
Usuario (1) ----< InscripcionCurso (estudiante)
Usuario (1) ----< Certificado (estudiante)
Usuario (1) ----< ResultadoEvaluacion (estudiante)
Usuario (1) ----< EntregaActividad (estudiante)

Profesor (1) ----< Curso (teaches)
Curso (1) ----< Actividad (includes)
Curso (1) ----< Evaluacion (consists of)
Curso (1) ----< InscripcionCurso (relates to)
Curso (1) ----< Certificado (relates to)

Actividad (1) ----< EntregaActividad (per student)
Evaluacion (1) ----< EvaluacionPregunta (consists of)
Evaluacion (1) ----< ResultadoEvaluacion (per student)

Pregunta (1) ----< EvaluacionPregunta (relates to)
```

## Estado del Proyecto

✅ **11 entidades creadas** según el diagrama ER
✅ **Todas las relaciones configuradas** (ManyToOne, OneToMany)
✅ **0 errores de compilación**
✅ **TypeORM configurado correctamente** con decoradores y metadata

## Archivos Generados

### Entidades (`src/domain/`)
- ✅ usuario.entity.ts
- ✅ profesor.entity.ts
- ✅ curso.entity.ts
- ✅ actividad.entity.ts
- ✅ evaluacion.entity.ts
- ✅ pregunta.entity.ts
- ✅ evaluacion-pregunta.entity.ts
- ✅ inscripcion-curso.entity.ts
- ✅ certificado.entity.ts
- ✅ resultado-evaluacion.entity.ts
- ✅ entrega-actividad.entity.ts

### Configuración
- ✅ tsconfig.json (con experimentalDecorators y emitDecoratorMetadata)
- ✅ package.json (con typeorm, reflect-metadata, sqlite3)

## Próximos Pasos Sugeridos

1. Actualizar `data-source.ts` para incluir todas las nuevas entidades
2. Crear servicios para las nuevas entidades (si es necesario)
3. Actualizar `main.ts` para probar las nuevas entidades
4. Ejecutar migraciones o sincronización de base de datos
