import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Controller('cursos')
export class CursoController {
  constructor(
    @Inject('CURSO_PUBLISHER') private readonly cursoClient: ClientProxy,
  ) {}

  
  @Post()
  async createCurso(@Body() body: {
    nombre: string;
    descripcion: string;
    cupos_totales: number;
  }) {
    const message_id = randomUUID();

    this.cursoClient.emit('course.create', {
      message_id,
      data: body,
    });

    console.log(`\n🎓 [GATEWAY] PUBLISHED course.create`);
    console.log(`   Message ID: ${message_id}`);
    console.log(`   Curso: ${body.nombre}`);

    return {
      message: 'Curso creado',
      message_id,
      curso: body,
    };
  }
}
