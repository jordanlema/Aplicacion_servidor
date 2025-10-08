import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Actividad } from "./actividad.entity";
import { Evaluacion } from "./evaluacion.entity";
import { InscripcionCurso } from "./inscripcion-curso.entity";
import { Certificado } from "./certificado.entity";

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  profesorId: number;

  @OneToMany(() => Actividad, actividad => actividad.curso)
  actividades!: Actividad[];

  @OneToMany(() => Evaluacion, evaluacion => evaluacion.curso)
  evaluaciones!: Evaluacion[];

  @OneToMany(() => InscripcionCurso, inscripcion => inscripcion.curso)
  inscripciones!: InscripcionCurso[];

  @OneToMany(() => Certificado, certificado => certificado.curso)
  certificados!: Certificado[];
}