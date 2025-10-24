import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class CursoCreditos {
  @Field(() => ID)
  cursoId: string;

  @Field()
  nombreCurso: string;

  @Field(() => Int)
  creditos: number;
}

@ObjectType()
export class UsuarioCreditos {
  @Field(() => ID)
  usuarioId: string;

  @Field()
  nombreUsuario: string;

  @Field(() => [CursoCreditos])
  cursos: CursoCreditos[];

  @Field(() => Int)
  totalCreditos: number;
}
