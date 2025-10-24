import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class ProfesorCursosEstudiantesService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findCursosConEstudiantes(profesorId: string) {
    const profesor = await this.serviceHttp.findProfesor(profesorId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    
    const cursosDelProfesor = todosCursos.filter((curso: any) => curso.id_profesor === profesorId);
    
    // Contar estudiantes por curso
    const cursosConEstudiantes = cursosDelProfesor.map((curso: any) => {
      const estudiantesEnCurso = todosCursos.filter((c: any) => 
        c.id === curso.id
      ).length;

      return {
        cursoId: curso.id,
        nombreCurso: curso.nombre,
        numeroEstudiantes: estudiantesEnCurso
      };
    });

    const totalEstudiantes = [...new Set(cursosDelProfesor.map((c: any) => c.id_usuario))].length;

    return {
      profesorId: profesor.id,
      nombreProfesor: profesor.nombre,
      cursos: cursosConEstudiantes,
      totalCursos: cursosConEstudiantes.length,
      totalEstudiantes
    };
  }
}
