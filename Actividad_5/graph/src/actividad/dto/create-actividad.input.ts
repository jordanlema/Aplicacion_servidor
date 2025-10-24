import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateActividadInput {
  @Field()
  nombre: string;

  @Field()
  tipo: string;

  @Field()
  id_curso: string;
}
