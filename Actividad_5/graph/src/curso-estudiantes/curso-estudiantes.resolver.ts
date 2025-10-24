import { Resolver, Query, Args } from '@nestjs/graphql';
import { CursoEstudiantes } from './entities/curso-estudiantes.entity';
import { CursoEstudiantesService } from './curso-estudiantes.service';

@Resolver(() => CursoEstudiantes)
export class CursoEstudiantesResolver {
  constructor(private readonly cursoEstudiantesService: CursoEstudiantesService) {}

  @Query(() => CursoEstudiantes, { name: 'cursoConEstudiantes' })
  findOne(@Args('cursoId') cursoId: string) {
    return this.cursoEstudiantesService.findEstudiantesByCurso(cursoId);
  }
}
