import { AppDataSource } from "./data-source";
import { UsuarioService } from "./services/usuario.service";
import { ProfesorService } from "./services/profesor.service";
import { PreguntaService } from "./services/pregunta.service";
import { CursoService } from "./services/curso.service";
import { ActividadService } from "./services/actividad.service";
import { EvaluacionService } from "./services/evaluacion.service";
import { EvaluacionPreguntaService } from "./services/evaluacion-pregunta.service";

async function main() {
  await AppDataSource.initialize();

  console.log("✅ Conexión establecida con la base de datos");

  const usuarioService = new UsuarioService();
  const profesorService = new ProfesorService();
  const preguntaService = new PreguntaService();

  const cursoService = new CursoService();
  const actividadService = new ActividadService();
  const evaluacionService = new EvaluacionService();
  const evaluacionPreguntaService = new EvaluacionPreguntaService();

  // Seed: usuario, profesor, pregunta
  const usuario = await usuarioService.create({ nombre: 'Jordan Lema', email: 'jordanLem@gmail.com', password: '1256', rol: 'PROFESOR' });
  const profesor = await profesorService.create({ experiencia: '5 años enseñando programación', estado: 'pendiente', usuario });
  const pregunta = await preguntaService.create({ enunciado: '¿Qué es TypeORM?', respuestaCorrecta: 'Un ORM para Node.js' });

  console.log('Usuario creado', usuario);
  console.log('Profesor creado', profesor);
  console.log('Pregunta creada', pregunta);

  // Seed: curso, actividad, evaluacion, evaluacion-pregunta
  const curso = await cursoService.create({ titulo: 'Programación Web', descripcion: 'Curso de Node.js y TypeORM', profesorId: profesor.id });
  const actividad = await actividadService.create({ cursoId: curso.id, titulo: 'Taller TypeORM', descripcion: 'Modelar entidades y servicios' });
  const evaluacion = await evaluacionService.create({ cursoId: curso.id, puntajeRequerido: 16.5 });
  const evPregunta = await evaluacionPreguntaService.create({ evaluacionId: evaluacion.id, preguntaId: pregunta.id });

  console.log('Curso, actividad, evaluación y link creados');

  // Mostrar resúmenes
  console.log('Cursos:', await cursoService.findAll());
  console.log('Actividades:', await actividadService.findAll());
  console.log('Evaluaciones:', await evaluacionService.findAll());
  console.log('EvaluacionPreguntas:', await evaluacionPreguntaService.findAll());

  await AppDataSource.destroy();
}

main().catch(err => console.error('Error en main:', err));