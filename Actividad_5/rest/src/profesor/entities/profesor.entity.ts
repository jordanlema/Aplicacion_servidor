import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { Curso } from "../../curso/entities/curso.entity";

@Entity({ name: "profesor" })
export class Profesor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column("text")
  experiencia: string;

  @Column({ 
    type: 'enum',
    enum: ['pendiente', 'aprobado', 'rechazado', 'suspendido'],
    default: 'pendiente'
  })
  estado: string;

  @OneToOne(() => Usuario, (usuario) => usuario.profesor)
  @JoinColumn({ name: "usuarioId" })
  usuario: Usuario;

  @OneToMany(() => Curso, (curso) => curso.profesor)
  cursos: Curso[];

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fechaActualizacion: Date;
}
