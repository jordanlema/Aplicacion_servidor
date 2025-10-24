import { Injectable } from '@nestjs/common';
import { ServiceHttp } from 'src/servicios/http.service';
import { EstudianteCursosMayorCreditoInput } from './dto/estudiante-cursos-mayor-credito.input';

@Injectable()
export class EstudianteCursosMayorCreditoService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  async findCursosMayorCredito(input: EstudianteCursosMayorCreditoInput) {
    const usuario = await this.serviceHttp.findUsuario(input.usuarioId);
    const todosCursos = await this.serviceHttp.findAllCursos();
    
    const cursosDelUsuario = todosCursos.filter((curso: any) => curso.id_usuario === input.usuarioId);
    
    if (cursosDelUsuario.length === 0) {
      return {
        usuarioId: usuario.id,
        nombreUsuario: usuario.nombre,
        cursos: [],
        maxCreditos: 0
      };
    }

    const maxCreditos = Math.max(...cursosDelUsuario.map((c: any) => parseInt(c.creditos)));
    let cursosConMayorCredito = cursosDelUsuario.filter((c: any) => parseInt(c.creditos) === maxCreditos);
    
    // Aplicar orden según el filtro
    if (input.orden === 'ASC') {
      cursosConMayorCredito = cursosConMayorCredito.sort((a: any, b: any) => parseInt(a.creditos) - parseInt(b.creditos));
    } else {
      cursosConMayorCredito = cursosConMayorCredito.sort((a: any, b: any) => parseInt(b.creditos) - parseInt(a.creditos));
    }

    return {
      usuarioId: usuario.id,
      nombreUsuario: usuario.nombre,
      cursos: cursosConMayorCredito,
      maxCreditos
    };
  }
}
