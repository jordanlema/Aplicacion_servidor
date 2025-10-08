import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Curso } from "./curso.entity";

@Entity()
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cursoId: number;

  @Column()
  estudianteId: number;

  @Column("date")
  fechaEmision: Date;

  @Column()
  codigoVerificacion: string;

  @ManyToOne(() => Curso, curso => curso.certificados)
  curso!: Curso;
}
