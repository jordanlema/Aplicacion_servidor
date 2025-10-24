import { CreateProfesorInput } from './create-profesor.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProfesorInput extends PartialType(CreateProfesorInput) {
  @Field()
  id: string;
}
