import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Evaluacion } from "./evaluacion.entity";
import { Pregunta } from "./pregunta.entity";

@Entity()
export class EvaluacionPregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  evaluacionId: number;

  @Column()
  preguntaId: number;

  @ManyToOne(() => Evaluacion, evaluacion => evaluacion.preguntas)
  evaluacion!: Evaluacion;

  @ManyToOne(() => Pregunta)
  pregunta!: Pregunta;
}