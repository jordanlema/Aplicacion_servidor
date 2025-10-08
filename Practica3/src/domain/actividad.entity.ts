import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Curso } from "./curso.entity";
import { EntregaActividad } from "./entrega-actividad.entity";

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cursoId: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @ManyToOne(() => Curso, curso => curso.actividades)
  curso!: Curso;

  @OneToMany(() => EntregaActividad, entrega => entrega.actividad)
  entregas!: EntregaActividad[];
}