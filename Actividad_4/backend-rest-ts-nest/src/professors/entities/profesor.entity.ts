import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Usuario } from "../../users/entities/usuario.entity";
import { Curso } from "../../courses/entities/curso.entity";

@Entity({ name: "profesor" })
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  experiencia: string;

  @Column()
  estado: string; // 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'

  @OneToOne(() => Usuario, (usuario) => usuario.profesor)
  @JoinColumn({ name: "usuarioId" })
  usuario: Usuario;

  @OneToMany(() => Curso, (curso) => curso.profesor)
  cursos: Curso[];
}
