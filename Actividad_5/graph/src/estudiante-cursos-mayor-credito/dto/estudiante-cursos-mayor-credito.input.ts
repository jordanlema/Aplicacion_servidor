import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EstudianteCursosMayorCreditoInput {
  @Field()
  usuarioId: string;

  @Field({ defaultValue: 'DESC', description: 'Orden de créditos: DESC (mayor a menor) o ASC (menor a mayor)' })
  orden: string;
}
