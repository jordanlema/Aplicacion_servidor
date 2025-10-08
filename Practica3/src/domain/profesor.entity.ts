import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, usuario => usuario.profesor)
  @JoinColumn()
  usuario: Usuario;

  @Column()
  experiencia: string;

  @Column()
  estado: string; // pendiente, aceptado, rechazado
}