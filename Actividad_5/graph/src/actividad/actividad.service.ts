import { Injectable } from '@nestjs/common';
import { CreateActividadInput } from './dto/create-actividad.input';
import { UpdateActividadInput } from './dto/update-actividad.input';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class ActividadService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  create(createActividadInput: CreateActividadInput) {
    return 'This action adds a new actividad';
  }

  findAll() {
    return this.serviceHttp.findAllActividades();
  }

  findOne(id: string) {
    return this.serviceHttp.findActividad(id);
  }

  update(id: string, updateActividadInput: UpdateActividadInput) {
    return `This action updates a #${id} actividad`;
  }

  remove(id: string) {
    return `This action removes a #${id} actividad`;
  }
}
