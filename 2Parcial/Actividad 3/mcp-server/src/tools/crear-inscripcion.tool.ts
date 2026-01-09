import { z } from 'zod';
import axios from 'axios';

const INSCRIPCION_URL = process.env.INSCRIPCION_URL || 'http://localhost:3002';

// Schema de entrada
export const CrearInscripcionSchema = z.object({
  curso_id: z.string().describe('ID del curso'),
  estudiante: z.string().describe('Nombre del estudiante')
});

export type CrearInscripcionInput = z.infer<typeof CrearInscripcionSchema>;

/**
 * TOOL 3: Crear Inscripción
 * Tipo: ⚙ Acción
 * 
 * Registra la inscripción de un estudiante a un curso.
 * Reduce automáticamente los cupos disponibles del curso.
 */
export async function crearInscripcion(params: CrearInscripcionInput): Promise<string> {
  try {
    console.error(`[TOOL] Creando inscripción: ${params.estudiante} -> Curso ${params.curso_id}`);
    
    // Llamar al backend REST para crear la inscripción
    const response = await axios.post(`${INSCRIPCION_URL}/inscripciones`, {
      curso_id: params.curso_id,
      estudiante_nombre: params.estudiante,
      estudiante_email: `estudiante${params.estudiante}@example.com`,
      status: 'PENDING'
    });

    const inscripcionData = response.data.inscripcion;
    
    console.error('[TOOL DEBUG] Respuesta de ms-inscripcion:', JSON.stringify(response.data, null, 2));

    return JSON.stringify({
      success: true,
      message: `${params.estudiante} fue inscrito correctamente`,
      inscripcion: {
        id: inscripcionData.id,
        estudiante: params.estudiante,
        curso_id: inscripcionData.curso_id,
        estado: inscripcionData.status,
        fecha: inscripcionData.created_at
      }
    });

  } catch (error: any) {
    console.error('[TOOL ERROR] crear_inscripcion:', error.message);
    
    // Manejar errores específicos
    if (error.response?.status === 400) {
      return JSON.stringify({
        success: false,
        message: error.response.data.message || 'No se pudo crear la inscripción. Verifica los cupos disponibles.',
        error: 'BAD_REQUEST'
      });
    }

    if (error.response?.status === 404) {
      return JSON.stringify({
        success: false,
        message: 'El curso especificado no existe',
        error: 'CURSO_NO_ENCONTRADO'
      });
    }

    if (error.response?.status === 409) {
      return JSON.stringify({
        success: false,
        message: 'El estudiante ya está inscrito en este curso',
        error: 'DUPLICADO'
      });
    }

    return JSON.stringify({
      success: false,
      message: `Error al crear inscripción: ${error.message}`,
      error: 'INTERNAL_ERROR'
    });
  }
}

// Metadatos del tool para MCP
export const crearInscripcionMetadata = {
  name: 'crear_inscripcion',
  description: 'Registra la inscripción de un estudiante en un curso. Reduce automáticamente los cupos disponibles.',
  inputSchema: {
    type: 'object',
    properties: {
      curso_id: {
        type: 'string',
        description: 'ID del curso al que se inscribe el estudiante'
      },
      estudiante: {
        type: 'string',
        description: 'Nombre completo del estudiante'
      }
    },
    required: ['curso_id', 'estudiante']
  }
};
