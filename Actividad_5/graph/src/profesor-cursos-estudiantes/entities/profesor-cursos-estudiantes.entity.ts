import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class CursoConEstudiantes {
  @Field(() => ID)
  cursoId: string;

  @Field()
  nombreCurso: string;

  @Field(() => Int)
  numeroEstudiantes: number;
}

@ObjectType()
export class ProfesorCursosEstudiantes {
  @Field(() => ID)
  profesorId: string;

  @Field()
  nombreProfesor: string;

  @Field(() => [CursoConEstudiantes])
  cursos: CursoConEstudiantes[];

  @Field(() => Int)
  totalCursos: number;

  @Field(() => Int)
  totalEstudiantes: number;
}
