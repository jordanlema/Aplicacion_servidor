import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Profesor } from 'src/profesor/entities/profesor.entity';
import { Actividad } from 'src/actividad/entities/actividad.entity';

@ObjectType()
export class Curso {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  creditos: string;

  @Field({ nullable: true })
  titulo?: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field({ nullable: true })
  requiereCertificado?: boolean;

  @Field(() => Usuario, { nullable: true })
  usuario?: Usuario;

  @Field(() => Profesor, { nullable: true })
  profesor?: Profesor;

  @Field(() => [Actividad], { nullable: true })
  actividades?: Actividad[];

  @Field({ nullable: true })
  fechaCreacion?: Date;

  @Field({ nullable: true })
  fechaActualizacion?: Date;
}
