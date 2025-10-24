import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@ObjectType()
export class CursoEstudiantes {
  @Field(() => ID)
  cursoId: string;

  @Field()
  nombreCurso: string;

  @Field()
  creditos: string;

  @Field(() => [Usuario])
  estudiantes: Usuario[];

  @Field(() => Int)
  totalEstudiantes: number;
}
