import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class UsuarioActividadesService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findActividadesByUsuario(usuarioId: string) {
    const usuario = await this.serviceHttp.findUsuario(usuarioId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    const todasActividades = await this.serviceHttp.findAllActividades();
    
    // Encontrar cursos del usuario
    const cursosDelUsuario = todosCursos.filter((curso: any) => curso.id_usuario === usuarioId);
    const idsCursosDelUsuario = cursosDelUsuario.map((c: any) => c.id);
    
    // Encontrar actividades de esos cursos
    const actividadesDelUsuario = todasActividades.filter((actividad: any) => 
      idsCursosDelUsuario.includes(actividad.id_curso)
    );

    return {
      usuarioId: usuario.id,
      nombreUsuario: usuario.nombre,
      actividades: actividadesDelUsuario,
      totalActividades: actividadesDelUsuario.length
    };
  }
}
