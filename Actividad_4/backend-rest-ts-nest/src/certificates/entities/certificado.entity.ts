import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "../../users/entities/usuario.entity";
import { Curso } from "../../courses/entities/curso.entity";

@Entity({ name: "certificado" })
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaEmision: Date;

  @Column()
  codigoVerificacion: string;

  @Column({ nullable: true })
  urlPDF: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuarioId" })
  usuario: Usuario;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: "cursoId" })
  curso: Curso;
}
