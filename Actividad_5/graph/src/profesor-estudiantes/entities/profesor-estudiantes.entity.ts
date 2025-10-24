import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@ObjectType()
export class ProfesorEstudiantes {
  @Field(() => ID)
  profesorId: string;

  @Field()
  nombreProfesor: string;

  @Field(() => [Usuario])
  estudiantes: Usuario[];

  @Field(() => Int)
  totalEstudiantes: number;
}
