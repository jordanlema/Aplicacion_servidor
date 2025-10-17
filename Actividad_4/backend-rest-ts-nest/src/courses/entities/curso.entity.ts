import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Profesor } from "../../professors/entities/profesor.entity";
import { Actividad } from "../../activities/entities/actividad.entity";
import { Certificado } from "../../certificates/entities/certificado.entity";

@Entity({ name: "curso" })
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ default: false })
  requiereCertificado: boolean;

  @ManyToOne(() => Profesor, (profesor) => profesor.cursos)
  profesor: Profesor;

  @OneToMany(() => Actividad, (actividad) => actividad.curso)
  actividades: Actividad[];

  @OneToMany(() => Certificado, (certificado) => certificado.curso)
  certificados: Certificado[];
}
