import { Injectable } from '@nestjs/common';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

const actividades = [
  { id: '1', nombre: 'Examen Parcial', tipo: 'Evaluación', id_curso: '1' },
  { id: '2', nombre: 'Tarea de Programación', tipo: 'Práctica', id_curso: '2' },
  { id: '3', nombre: 'Proyecto Final', tipo: 'Proyecto', id_curso: '3' },
];

@Injectable()
export class ActividadService {
  create(createActividadDto: CreateActividadDto) {
    return 'This action adds a new actividad';
  }

  findAll() {
    return actividades;
  }

  findOne(id: string) {
    return actividades.find((actividad) => actividad.id === id);
  }

  update(id: string, updateActividadDto: UpdateActividadDto) {
    return `This action updates a #${id} actividad`;
  }

  remove(id: string) {
    return `This action removes a #${id} actividad`;
  }
}
