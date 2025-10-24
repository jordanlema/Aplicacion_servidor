import { Resolver, Query, Args } from '@nestjs/graphql';
import { EstudianteCursosMayorCredito } from './entities/estudiante-cursos-mayor-credito.entity';
import { EstudianteCursosMayorCreditoService } from './estudiante-cursos-mayor-credito.service';
import { EstudianteCursosMayorCreditoInput } from './dto/estudiante-cursos-mayor-credito.input';

@Resolver(() => EstudianteCursosMayorCredito)
export class EstudianteCursosMayorCreditoResolver {
  constructor(private readonly estudianteCursosMayorCreditoService: EstudianteCursosMayorCreditoService) {}

  @Query(() => EstudianteCursosMayorCredito, { name: 'estudianteCursosMayorCredito' })
  findOne(@Args('input') input: EstudianteCursosMayorCreditoInput) {
    return this.estudianteCursosMayorCreditoService.findCursosMayorCredito(input);
  }
}
