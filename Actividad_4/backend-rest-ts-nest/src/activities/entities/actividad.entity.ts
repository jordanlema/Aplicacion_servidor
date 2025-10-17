import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Curso } from "../../courses/entities/curso.entity";

@Entity({ name: "actividad" })
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @ManyToOne(() => Curso, (curso) => curso.actividades)
  curso: Curso;
}
