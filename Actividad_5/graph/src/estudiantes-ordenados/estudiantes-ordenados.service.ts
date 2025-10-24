import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';
import { EstudiantesOrdenadosInput } from './dto/estudiantes-ordenados.input';

@Injectable()
export class EstudiantesOrdenadosService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findEstudiantesOrdenados(input: EstudiantesOrdenadosInput) {
    const profesor = await this.serviceHttp.findProfesor(input.profesorId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    const todosUsuarios = await this.serviceHttp.findAllUsuarios();
    
    const cursosDelProfesor = todosCursos.filter((curso: any) => curso.id_profesor === input.profesorId);
    const idsEstudiantes = [...new Set(cursosDelProfesor.map((c: any) => c.id_usuario))];
    
    let estudiantes = todosUsuarios.filter((usuario: any) => idsEstudiantes.includes(usuario.id));
    
    // Aplicar orden según el filtro
    if (input.orden === 'DESC') {
      estudiantes = estudiantes.sort((a: any, b: any) => b.nombre.localeCompare(a.nombre));
    } else {
      estudiantes = estudiantes.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    }

    return {
      profesorId: profesor.id,
      nombreProfesor: profesor.nombre,
      estudiantes,
      totalEstudiantes: estudiantes.length
    };
  }
}
