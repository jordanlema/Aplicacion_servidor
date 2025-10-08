import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "./domain/usuario.entity";
import { Profesor } from "./domain/profesor.entity";
import { Curso } from "./domain/curso.entity";
import { Actividad } from "./domain/actividad.entity";
import { Evaluacion } from "./domain/evaluacion.entity";
import { Pregunta } from "./domain/pregunta.entity";
import { EvaluacionPregunta } from "./domain/evaluacion-pregunta.entity";
import { InscripcionCurso } from "./domain/inscripcion-curso.entity";
import { Certificado } from "./domain/certificado.entity";
import { ResultadoEvaluacion } from "./domain/resultado-evaluacion.entity";
import { EntregaActividad } from "./domain/entrega-actividad.entity";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true,
  logging: false,
  entities: [
    Usuario,
    Profesor,
    Curso,
    Actividad,
    Evaluacion,
    Pregunta,
    EvaluacionPregunta,
    InscripcionCurso,
    Certificado,
    ResultadoEvaluacion,
    EntregaActividad,
  ],
});