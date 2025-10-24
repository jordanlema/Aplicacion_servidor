import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Curso } from 'src/curso/entities/curso.entity';

@ObjectType()
export class Profesor {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  nombre?: string;

  @Field({ nullable: true })
  especialidad?: string;

  @Field({ nullable: true })
  experiencia?: string;

  @Field({ nullable: true })
  estado?: string;

  @Field(() => Usuario, { nullable: true })
  usuario?: Usuario;

  @Field(() => [Curso], { nullable: true })
  cursos?: Curso[];

  @Field({ nullable: true })
  fechaCreacion?: Date;

  @Field({ nullable: true })
  fechaActualizacion?: Date;
}
