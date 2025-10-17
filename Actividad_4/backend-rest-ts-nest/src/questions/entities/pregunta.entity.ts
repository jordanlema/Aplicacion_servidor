import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "pregunta" })
export class Pregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  enunciado: string;

  @Column("text")
  respuestaCorrecta: string;
}
