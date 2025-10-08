import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Curso } from "./curso.entity";

@Entity()
export class InscripcionCurso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cursoId: number;

  @Column()
  estudianteId: number;

  @ManyToOne(() => Curso, curso => curso.inscripciones)
  curso!: Curso;
}
