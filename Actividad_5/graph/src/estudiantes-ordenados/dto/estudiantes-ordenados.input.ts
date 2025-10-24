import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EstudiantesOrdenadosInput {
  @Field()
  profesorId: string;

  @Field({ defaultValue: 'ASC', description: 'Orden: ASC (A-Z) o DESC (Z-A)' })
  orden: string;
}
