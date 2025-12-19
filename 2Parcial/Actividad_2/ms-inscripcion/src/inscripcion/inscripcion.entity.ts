import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inscripcion')
export class Inscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  curso_id: string;

  @Column()
  estudiante_nombre: string;

  @Column()
  estudiante_email: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, CONFIRMED, FAILED

  @Column({ unique: true })
  message_id: string; // Para idempotencia

  @CreateDateColumn()
  created_at: Date;
}
