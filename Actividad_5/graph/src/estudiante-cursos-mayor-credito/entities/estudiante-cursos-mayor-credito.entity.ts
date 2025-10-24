import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Curso } from 'src/curso/entities/curso.entity';

@ObjectType()
export class EstudianteCursosMayorCredito {
  @Field(() => ID)
  usuarioId: string;

  @Field()
  nombreUsuario: string;

  @Field(() => [Curso])
  cursos: Curso[];

  @Field(() => Int, { nullable: true })
  maxCreditos?: number;
}
