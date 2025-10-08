import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Curso } from "./curso.entity";
import { EvaluacionPregunta } from "./evaluacion-pregunta.entity";
import { ResultadoEvaluacion } from "./resultado-evaluacion.entity";

@Entity()
export class Evaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cursoId: number;

  @Column("float")
  puntajeRequerido: number;

  @ManyToOne(() => Curso, curso => curso.evaluaciones)
  curso!: Curso;

  @OneToMany(() => EvaluacionPregunta, ep => ep.evaluacion)
  preguntas!: EvaluacionPregunta[];

  @OneToMany(() => ResultadoEvaluacion, resultado => resultado.evaluacion)
  resultados!: ResultadoEvaluacion[];
}