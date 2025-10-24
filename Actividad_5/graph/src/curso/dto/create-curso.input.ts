import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCursoInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
