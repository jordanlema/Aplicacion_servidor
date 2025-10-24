import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class CursoEstudiantesService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findEstudiantesByCurso(cursoId: string) {
    const curso = await this.serviceHttp.findCurso(cursoId);
    const todosUsuarios = await this.serviceHttp.findAllUsuarios();
    const todosCursos = await this.serviceHttp.findAllCursos();
    
    // Encontrar todos los usuarios inscritos en este curso
    const estudiantesInscritos = todosCursos
      .filter((c: any) => c.id === cursoId)
      .map((c: any) => c.id_usuario)
      .filter((id, index, self) => self.indexOf(id) === index);

    const estudiantes = todosUsuarios.filter((usuario: any) => 
      estudiantesInscritos.includes(usuario.id)
    );

    return {
      cursoId: curso.id,
      nombreCurso: curso.nombre,
      creditos: curso.creditos,
      estudiantes,
      totalEstudiantes: estudiantes.length
    };
  }
}
