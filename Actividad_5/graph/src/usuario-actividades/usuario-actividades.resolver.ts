import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsuarioActividades } from './entities/usuario-actividades.entity';
import { UsuarioActividadesService } from './usuario-actividades.service';

@Resolver(() => UsuarioActividades)
export class UsuarioActividadesResolver {
  constructor(private readonly usuarioActividadesService: UsuarioActividadesService) {}

  @Query(() => UsuarioActividades, { name: 'usuarioConActividades' })
  findOne(@Args('usuarioId') usuarioId: string) {
    return this.usuarioActividadesService.findActividadesByUsuario(usuarioId);
  }
}
