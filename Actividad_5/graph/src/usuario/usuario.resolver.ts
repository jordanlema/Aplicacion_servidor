import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { ServiceHttp } from 'src/servicios/http.service';
import { Curso } from 'src/curso/entities/curso.entity';
import { Param } from '@nestjs/common';

@Resolver(() => Usuario)
export class UsuarioResolver {
  constructor(private readonly usuarioService: ServiceHttp) { }

  @Query(() => [Usuario], { name: 'usuarios' })
  findAll() {
    return this.usuarioService.findAllUsuarios();
  }

  @Query(() => Usuario, { name: 'usuario' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.usuarioService.findUsuario(id);
  }

  // TODO: Descomentar cuando se conecte TypeORM con la base de datos
  // Las relaciones se resolverán automáticamente desde la entidad
  // @ResolveField()
  // async profesor(@Parent() usuario: Usuario) {
  //   return usuario.profesor;
  // }
}
