import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Profesor } from "../../profesor/entities/profesor.entity";

@Entity({ name: "usuario" })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({ 
    type: 'enum',
    enum: ['ESTUDIANTE', 'PROFESOR', 'ADMIN'],
    default: 'ESTUDIANTE'
  })
  rol: string;

  @OneToOne(() => Profesor, (profesor) => profesor.usuario)
  profesor?: Profesor;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fechaActualizacion: Date;
}
