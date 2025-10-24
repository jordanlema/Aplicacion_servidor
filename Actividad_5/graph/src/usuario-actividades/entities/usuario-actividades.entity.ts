import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Actividad } from 'src/actividad/entities/actividad.entity';

@ObjectType()
export class UsuarioActividades {
  @Field(() => ID)
  usuarioId: string;

  @Field()
  nombreUsuario: string;

  @Field(() => [Actividad])
  actividades: Actividad[];

  @Field(() => Int)
  totalActividades: number;
}
