import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Curso } from 'src/curso/entities/curso.entity';

@ObjectType()
export class ProfesorCursos {
  @Field(() => ID)
  profesorId: string;

  @Field()
  nombreProfesor: string;

  @Field({ nullable: true })
  especialidad?: string;

  @Field(() => [Curso])
  cursos: Curso[];

  @Field(() => Int)
  totalCursos: number;
}
