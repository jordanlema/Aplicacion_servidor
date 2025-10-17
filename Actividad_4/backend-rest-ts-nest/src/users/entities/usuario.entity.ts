import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Profesor } from "../../professors/entities/profesor.entity";

@Entity({ name: "usuario" })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  rol: string; // 'ESTUDIANTE' | 'PROFESOR' | 'ADMIN'

  @OneToOne(() => Profesor, (profesor) => profesor.usuario)
  profesor?: Profesor;
}
