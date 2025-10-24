import { Resolver, Query, Args } from '@nestjs/graphql';
import { EstudiantesOrdenados } from './entities/estudiantes-ordenados.entity';
import { EstudiantesOrdenadosService } from './estudiantes-ordenados.service';
import { EstudiantesOrdenadosInput } from './dto/estudiantes-ordenados.input';

@Resolver(() => EstudiantesOrdenados)
export class EstudiantesOrdenadosResolver {
  constructor(private readonly estudiantesOrdenadosService: EstudiantesOrdenadosService) {}

  @Query(() => EstudiantesOrdenados, { name: 'estudiantesOrdenados' })
  findOne(@Args('input') input: EstudiantesOrdenadosInput) {
    return this.estudiantesOrdenadosService.findEstudiantesOrdenados(input);
  }
}
