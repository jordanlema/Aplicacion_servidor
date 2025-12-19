import { Controller, Post, Body, Get } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';

@Controller('inscripciones')
export class InscripcionController {
  constructor(private readonly inscripcionService: InscripcionService) {}

  /**
   * Endpoint principal: Crear inscripción
   * Acepta un idempotency_key opcional en el header o body
   */
  @Post()
  async createInscripcion(
    @Body() body: {
      curso_id: string;
      estudiante_nombre: string;
      estudiante_email: string;
      idempotency_key?: string;
    },
  ) {
    console.log('\n🌐 POST /inscripciones recibido');
    
    const result = await this.inscripcionService.createInscripcion(body);

    return {
      success: true,
      message: result.isNew ? 'Inscripción creada exitosamente' : 'Inscripción ya existía (idempotencia)',
      inscripcion: result.inscripcion,
      isNew: result.isNew,
    };
  }

  /**
   * Listar todas las inscripciones
   */
  @Get()
  async findAll() {
    const inscripciones = await this.inscripcionService.findAll();
    return {
      total: inscripciones.length,
      inscripciones,
    };
  }
}
