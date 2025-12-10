import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

@Controller('inscripciones')
export class InscripcionController {
  private readonly inscripcionServiceUrl = 'http://ms-inscripcion:3002';

  /**
   * Gateway: Redirige peticiones a ms-inscripcion
   * Maneja idempotency_key del cliente
   */
  @Post()
  async createInscripcion(
    @Body() body: {
      curso_id: string;
      estudiante_nombre: string;
      estudiante_email: string;
      idempotency_key?: string;
    },
    @Headers('idempotency-key') idempotencyHeader?: string,
  ) {
    // Usar idempotency_key del header, body, o generar uno nuevo
    const idempotencyKey = idempotencyHeader || body.idempotency_key || randomUUID();

    console.log('\n🌐 [GATEWAY] POST /inscripciones');
    console.log(`   Idempotency Key: ${idempotencyKey}`);
    console.log(`   Curso: ${body.curso_id}`);
    console.log(`   Estudiante: ${body.estudiante_nombre}`);

    // Llamar directamente a ms-inscripcion (HTTP)
    const response = await fetch(`${this.inscripcionServiceUrl}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        idempotency_key: idempotencyKey,
      }),
    });

    const result = await response.json();

    return {
      ...result,
      idempotency_key: idempotencyKey,
    };
  }

  @Get()
  async getInscripciones() {
    const response = await fetch(`${this.inscripcionServiceUrl}/inscripciones`);
    return response.json();
  }
}
