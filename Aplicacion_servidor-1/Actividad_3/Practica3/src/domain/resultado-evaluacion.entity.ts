import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Evaluacion } from "./evaluacion.entity";

@Entity()
export class ResultadoEvaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  evaluacionId: number;

  @Column()
  estudianteId: number;

  @Column("float")
  puntajeObtenido: number;

  @ManyToOne(() => Evaluacion, evaluacion => evaluacion.resultados)
  evaluacion!: Evaluacion;
}
