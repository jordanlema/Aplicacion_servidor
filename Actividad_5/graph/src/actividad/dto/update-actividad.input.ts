import { CreateActividadInput } from './create-actividad.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateActividadInput extends PartialType(CreateActividadInput) {
  @Field()
  id: string;
}
