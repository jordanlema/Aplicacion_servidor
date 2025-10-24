import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Curso } from 'src/curso/entities/curso.entity';

@ObjectType()
export class Actividad {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  tipo: string;

  @Field({ nullable: true })
  titulo?: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field(() => Curso, { nullable: true })
  curso?: Curso;

  @Field({ nullable: true })
  fechaCreacion?: Date;

  @Field({ nullable: true })
  fechaActualizacion?: Date;
}
