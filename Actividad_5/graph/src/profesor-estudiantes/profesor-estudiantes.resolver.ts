import { Resolver, Query, Args } from '@nestjs/graphql';
import { ProfesorEstudiantes } from './entities/profesor-estudiantes.entity';
import { ProfesorEstudiantesService } from './profesor-estudiantes.service';

@Resolver(() => ProfesorEstudiantes)
export class ProfesorEstudiantesResolver {
  constructor(private readonly profesorEstudiantesService: ProfesorEstudiantesService) {}

  @Query(() => ProfesorEstudiantes, { name: 'profesorConEstudiantes' })
  findOne(@Args('profesorId') profesorId: string) {
    return this.profesorEstudiantesService.findEstudiantesByProfesor(profesorId);
  }
}
