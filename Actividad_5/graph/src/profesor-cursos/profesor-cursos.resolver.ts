import { Resolver, Query, Args } from '@nestjs/graphql';
import { ProfesorCursos } from './entities/profesor-cursos.entity';
import { ProfesorCursosService } from './profesor-cursos.service';

@Resolver(() => ProfesorCursos)
export class ProfesorCursosResolver {
  constructor(private readonly profesorCursosService: ProfesorCursosService) {}

  @Query(() => [ProfesorCursos], { name: 'profesoresConCursos' })
  findAll() {
    return this.profesorCursosService.findAllProfesoresConCursos();
  }

  @Query(() => ProfesorCursos, { name: 'profesorConCursos' })
  findOne(@Args('profesorId') profesorId: string) {
    return this.profesorCursosService.findCursosByProfesor(profesorId);
  }
}
