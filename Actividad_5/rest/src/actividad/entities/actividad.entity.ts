import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Curso } from "../../curso/entities/curso.entity";

@Entity({ name: "actividad" })
export class Actividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @ManyToOne(() => Curso, (curso) => curso.actividades)
  @JoinColumn({ name: "cursoId" })
  curso: Curso;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fechaActualizacion: Date;
}
