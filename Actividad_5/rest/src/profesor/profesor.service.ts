import { Injectable } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

const profesores = [{
  id: "1",
  nombre: "Dr. García",
  especialidad: "Matemáticas"
},
{
  id: "2",
  nombre: "Dra. López",
  especialidad: "Programación"
},
{
  id: "3",
  nombre: "Dr. Martínez",
  especialidad: "Base de Datos"
}]

@Injectable()
export class ProfesorService {

  findAll() {
    return profesores
  }

  findOne(id: string) {
    const profesor = profesores.find((profesor)=>profesor.id === id)
    return profesor
  }

}
