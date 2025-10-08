import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Pregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enunciado: string;

  @Column()
  respuestaCorrecta: string;
}
