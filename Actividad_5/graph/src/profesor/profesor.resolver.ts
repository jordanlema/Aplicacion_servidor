import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ProfesorService } from './profesor.service';
import { Profesor } from './entities/profesor.entity';
import { CreateProfesorInput } from './dto/create-profesor.input';
import { UpdateProfesorInput } from './dto/update-profesor.input';
import { ServiceHttp } from 'src/servicios/http.service';

@Resolver(() => Profesor)
export class ProfesorResolver {
  constructor(
    private readonly profesorService: ProfesorService,
    private readonly serviceHttp: ServiceHttp,
  ) {}

  @Mutation(() => Profesor)
  createProfesor(@Args('createProfesorInput') createProfesorInput: CreateProfesorInput) {
    return this.profesorService.create(createProfesorInput);
  }

  @Query(() => [Profesor], { name: 'profesores' })
  findAll() {
    return this.profesorService.findAll();
  }

  @Query(() => Profesor, { name: 'profesor' })
  findOne(@Args('id') id: string) {
    return this.profesorService.findOne(id);
  }

  @Mutation(() => Profesor)
  updateProfesor(@Args('updateProfesorInput') updateProfesorInput: UpdateProfesorInput) {
    return this.profesorService.update(updateProfesorInput.id, updateProfesorInput);
  }

  @Mutation(() => Profesor)
  removeProfesor(@Args('id') id: string) {
    return this.profesorService.remove(id);
  }

  // TODO: Descomentar cuando se conecte TypeORM con la base de datos
  // Las relaciones se resolverán automáticamente desde la entidad
  // @ResolveField()
  // async usuario(@Parent() profesor: Profesor) {
  //   return profesor.usuario;
  // }

  // @ResolveField()
  // async cursos(@Parent() profesor: Profesor) {
  //   return profesor.cursos;
  // }
}
