import { CreateCursoInput } from './create-curso.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCursoInput extends PartialType(CreateCursoInput) {
  @Field(() => Int)
  id: number;
}
