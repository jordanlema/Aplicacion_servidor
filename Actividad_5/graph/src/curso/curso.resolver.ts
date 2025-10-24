import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Curso } from './entities/curso.entity';
import { ServiceHttp } from 'src/servicios/http.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Profesor } from 'src/profesor/entities/profesor.entity';

@Resolver(() => Curso)
export class CursoResolver {
  constructor(private readonly cursoService:ServiceHttp) {}

  @Query(() => [Curso], { name: 'cursos' })
  findAll() {
    return this.cursoService.findAllCursos();
  }

  @Query(() => Curso, { name: 'curso' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.cursoService.findCurso(id);
  }

  @ResolveField(() => Usuario)
  async usuario(@Parent() curso: any) {
    if (curso.id_usuario) {
      return await this.cursoService.findUsuario(curso.id_usuario);
    }
    return null;
  }

  @ResolveField(() => Profesor)
  async profesor(@Parent() curso: any) {
    if (curso.id_profesor) {
      return await this.cursoService.findProfesor(curso.id_profesor);
    }
    return null;
  }

  @ResolveField()
  async actividades(@Parent() curso: any) {
    const actividades = await this.cursoService.findAllActividades();
    return actividades.filter((actividad: any) => actividad.id_curso === curso.id);
  }

}
