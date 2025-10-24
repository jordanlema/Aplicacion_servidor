import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Profesor } from 'src/profesor/entities/profesor.entity';

@ObjectType()
export class Usuario {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  correo: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  rol?: string;

  @Field(() => Profesor, { nullable: true })
  profesor?: Profesor;

  @Field({ nullable: true })
  fechaCreacion?: Date;

  @Field({ nullable: true })
  fechaActualizacion?: Date;
}
