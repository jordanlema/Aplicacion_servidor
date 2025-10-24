import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Profesor } from "../../profesor/entities/profesor.entity";
import { Actividad } from "../../actividad/entities/actividad.entity";

@Entity({ name: "curso" })
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ default: false })
  requiereCertificado: boolean;

  @ManyToOne(() => Profesor, (profesor) => profesor.cursos)
  @JoinColumn({ name: "profesorId" })
  profesor: Profesor;

  @OneToMany(() => Actividad, (actividad) => actividad.curso)
  actividades: Actividad[];

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fechaActualizacion: Date;
}
