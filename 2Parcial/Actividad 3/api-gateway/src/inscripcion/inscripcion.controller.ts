import { Controller, Post, Body, Get } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';

export class ProcessRequestDto {
  message: string;
}

/**
 * Controlador principal de inscripciones
 * 
 * Expone un endpoint simple para que los usuarios interactúen
 * con el sistema usando lenguaje natural.
 */

@Controller('inscripcion')
export class InscripcionController {
  constructor(private geminiService: GeminiService) {}

  /**
   * POST /inscripcion/process
   * 
   * Procesa una solicitud en lenguaje natural.
   * 
   * Ejemplos:
   * - "Inscribe a Juan Pérez en el curso de Programación Web"
   * - "¿Qué cursos están disponibles?"
   * - "¿El curso de Base de Datos tiene cupos?"
   */
  @Post('process')
  async process(@Body() dto: ProcessRequestDto) {
    try {
      const response = await this.geminiService.processRequest(dto.message);
      
      return {
        success: true,
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /inscripcion/health
   * 
   * Verifica el estado del sistema (Gemini + MCP)
   */
  @Get('health')
  async health() {
    return await this.geminiService.healthCheck();
  }
}
