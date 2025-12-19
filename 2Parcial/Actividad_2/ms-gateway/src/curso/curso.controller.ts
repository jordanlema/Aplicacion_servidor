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
    idempotency_key?: string;
  }) {
    // 🔒 Usar idempotency_key del body si existe, sino generar uno nuevo
    const message_id = body.idempotency_key || randomUUID();

    this.cursoClient.emit('course.create', {
      message_id,
      data: body,
    });

    console.log(`\n🎓 [GATEWAY] PUBLISHED course.create`);
    console.log(`   Message ID: ${message_id}`);
    console.log(`   Curso: ${body.nombre}`);
    if (body.idempotency_key) {
      console.log(`   🔒 Idempotency Key (del cliente): ${body.idempotency_key}`);
    }

    return {
      message: 'Curso creado',
      message_id,
      curso: body,
    };
  }
}
