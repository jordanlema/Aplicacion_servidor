import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateProfesorInput {
  @Field()
  nombre: string;

  @Field()
  especialidad: string;
}
