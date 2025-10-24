import { Injectable } from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

const cursos = [{
  id: "1",
  nombre: "Matemáticas",
  creditos: "4",
  id_usuario: "1",
  id_profesor: "1"
},
{
  id: "2",
  nombre: "Programación",
  creditos: "5",
  id_usuario: "2",
  id_profesor: "2"
},
{
  id: "3",
  nombre: "Base de Datos",
  creditos: "4",
  id_usuario: "1",
  id_profesor: "3"
}]

@Injectable()
export class CursoService {

  findAll() {
    return cursos
  }

  findOne(id: string) {
    const curso = cursos.find((curso)=> curso.id ===id)
    return curso
  }
}
