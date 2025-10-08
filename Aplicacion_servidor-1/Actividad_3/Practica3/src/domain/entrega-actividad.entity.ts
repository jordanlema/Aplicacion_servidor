import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Actividad } from "./actividad.entity";

@Entity()
export class EntregaActividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  actividadId: number;

  @Column()
  estudianteId: number;

  @Column()
  archivoURL: string;

  @Column("date")
  fechaEnvio: Date;

  @ManyToOne(() => Actividad, actividad => actividad.entregas)
  actividad!: Actividad;
}
