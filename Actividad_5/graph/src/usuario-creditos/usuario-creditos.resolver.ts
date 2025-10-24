import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsuarioCreditos } from './entities/usuario-creditos.entity';
import { UsuarioCreditosService } from './usuario-creditos.service';

@Resolver(() => UsuarioCreditos)
export class UsuarioCreditosResolver {
  constructor(private readonly usuarioCreditosService: UsuarioCreditosService) {}

  @Query(() => UsuarioCreditos, { name: 'usuarioConCreditos' })
  findOne(@Args('usuarioId') usuarioId: string) {
    return this.usuarioCreditosService.findCreditosByUsuario(usuarioId);
  }
}
