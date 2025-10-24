import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class ProfesorCursosService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findCursosByProfesor(profesorId: string) {
    const profesor = await this.serviceHttp.findProfesor(profesorId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    
    const cursosDelProfesor = todosCursos.filter(
      (curso: any) => curso.id_profesor === profesorId
    );

    return {
      profesorId: profesor.id,
      nombreProfesor: profesor.nombre,
      especialidad: profesor.especialidad,
      cursos: cursosDelProfesor,
      totalCursos: cursosDelProfesor.length
    };
  }

  async findAllProfesoresConCursos() {
    const profesores = await this.serviceHttp.findAllProfesores();
    const todosCursos = await this.serviceHttp.findAllCursos();

    return profesores.map((profesor: any) => {
      const cursosDelProfesor = todosCursos.filter(
        (curso: any) => curso.id_profesor === profesor.id
      );

      return {
        profesorId: profesor.id,
        nombreProfesor: profesor.nombre,
        especialidad: profesor.especialidad,
        cursos: cursosDelProfesor,
        totalCursos: cursosDelProfesor.length
      };
    });
  }
}
