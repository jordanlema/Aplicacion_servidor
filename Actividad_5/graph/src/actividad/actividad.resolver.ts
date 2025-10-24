import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ActividadService } from './actividad.service';
import { Actividad } from './entities/actividad.entity';
import { CreateActividadInput } from './dto/create-actividad.input';
import { UpdateActividadInput } from './dto/update-actividad.input';
import { ServiceHttp } from 'src/servicios/http.service';

@Resolver(() => Actividad)
export class ActividadResolver {
  constructor(
    private readonly actividadService: ActividadService,
    private readonly serviceHttp: ServiceHttp,
  ) {}

  @Mutation(() => Actividad)
  createActividad(@Args('createActividadInput') createActividadInput: CreateActividadInput) {
    return this.actividadService.create(createActividadInput);
  }

  @Query(() => [Actividad], { name: 'actividades' })
  findAll() {
    return this.actividadService.findAll();
  }

  @Query(() => Actividad, { name: 'actividad' })
  findOne(@Args('id') id: string) {
    return this.actividadService.findOne(id);
  }

  @Mutation(() => Actividad)
  updateActividad(@Args('updateActividadInput') updateActividadInput: UpdateActividadInput) {
    return this.actividadService.update(updateActividadInput.id, updateActividadInput);
  }

  @Mutation(() => Actividad)
  removeActividad(@Args('id') id: string) {
    return this.actividadService.remove(id);
  }

  @ResolveField()
  async curso(@Parent() actividad: any) {
    if (actividad.id_curso) {
      return await this.serviceHttp.findCurso(actividad.id_curso);
    }
    return null;
  }
}
