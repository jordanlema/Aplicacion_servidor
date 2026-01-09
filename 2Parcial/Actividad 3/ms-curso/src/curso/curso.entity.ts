import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('curso')
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column({ type: 'int' })
  cupos_totales: number;

  @Column({ type: 'int', default: 0 })
  cupos_ocupados: number;

  @CreateDateColumn()
  created_at: Date;

  // Método helper para verificar disponibilidad
  get cupos_disponibles(): number {
    return this.cupos_totales - this.cupos_ocupados;
  }

  get tiene_cupos(): boolean {
    return this.cupos_disponibles > 0;
  }
}
