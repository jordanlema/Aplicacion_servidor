import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Profesor } from "./profesor.entity";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  rol: string; // estudiante, profesor, admin, etc.

  @OneToOne(() => Profesor, profesor => profesor.usuario)
  profesor: Profesor;
}
