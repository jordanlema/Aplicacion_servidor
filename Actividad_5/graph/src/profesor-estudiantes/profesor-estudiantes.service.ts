import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class ProfesorEstudiantesService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findEstudiantesByProfesor(profesorId: string) {
    const profesor = await this.serviceHttp.findProfesor(profesorId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    const todosUsuarios = await this.serviceHttp.findAllUsuarios();
    
    // Encontrar cursos del profesor
    const cursosDelProfesor = todosCursos.filter((curso: any) => curso.id_profesor === profesorId);
    
    // Encontrar IDs únicos de estudiantes
    const idsEstudiantes = cursosDelProfesor
      .map((c: any) => c.id_usuario)
      .filter((id, index, self) => self.indexOf(id) === index);
    
    // Obtener usuarios
    const estudiantes = todosUsuarios.filter((usuario: any) => 
      idsEstudiantes.includes(usuario.id)
    );

    return {
      profesorId: profesor.id,
      nombreProfesor: profesor.nombre,
      estudiantes,
      totalEstudiantes: estudiantes.length
    };
  }
}
