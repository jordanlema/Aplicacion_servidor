import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class UsuarioCreditosService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findCreditosByUsuario(usuarioId: string) {
    const usuario = await this.serviceHttp.findUsuario(usuarioId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    
    const cursosDelUsuario = todosCursos.filter((curso: any) => curso.id_usuario === usuarioId);
    
    const cursos = cursosDelUsuario.map((curso: any) => ({
      cursoId: curso.id,
      nombreCurso: curso.nombre,
      creditos: parseInt(curso.creditos)
    }));

    const totalCreditos = cursos.reduce((sum, curso) => sum + curso.creditos, 0);

    return {
      usuarioId: usuario.id,
      nombreUsuario: usuario.nombre,
      cursos,
      totalCreditos
    };
  }
}
