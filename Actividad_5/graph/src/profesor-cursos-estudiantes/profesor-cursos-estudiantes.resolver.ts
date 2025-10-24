import { Resolver, Query, Args } from '@nestjs/graphql';
import { ProfesorCursosEstudiantes } from './entities/profesor-cursos-estudiantes.entity';
import { ProfesorCursosEstudiantesService } from './profesor-cursos-estudiantes.service';

@Resolver(() => ProfesorCursosEstudiantes)
export class ProfesorCursosEstudiantesResolver {
  constructor(private readonly profesorCursosEstudiantesService: ProfesorCursosEstudiantesService) {}

  @Query(() => ProfesorCursosEstudiantes, { name: 'profesorCursosConEstudiantes' })
  findOne(@Args('profesorId') profesorId: string) {
    return this.profesorCursosEstudiantesService.findCursosConEstudiantes(profesorId);
  }
}
