import { z } from 'zod';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Schema de entrada
export const ValidarCuposSchema = z.object({
  curso_id: z.string().describe('ID del curso a validar')
});

export type ValidarCuposInput = z.infer<typeof ValidarCuposSchema>;

/**
 * TOOL 2: Validar Cupos
 * Tipo: ✅ Validación
 * 
 * Verifica si un curso específico tiene cupos disponibles.
 * Valida la existencia del curso y su disponibilidad.
 */
export async function validarCupos(params: ValidarCuposInput): Promise<string> {
  try {
    console.error(`[TOOL] Validando cupos para curso: ${params.curso_id}`);
    
    // Llamar al backend REST
    const response = await axios.get(`${BACKEND_URL}/cursos/${params.curso_id}`);
    const curso = response.data;

    if (!curso) {
      return JSON.stringify({
        success: false,
        valid: false,
        message: 'Curso no encontrado',
        curso_id: params.curso_id
      });
    }

    const cupos_disponibles = curso.cupos_totales - curso.cupos_ocupados;
    const tiene_cupos = cupos_disponibles > 0;

    return JSON.stringify({
      success: true,
      valid: tiene_cupos,
      message: tiene_cupos 
        ? `El curso "${curso.nombre}" tiene ${cupos_disponibles} cupos disponibles`
        : `El curso "${curso.nombre}" NO tiene cupos disponibles (${curso.cupos_ocupados}/${curso.cupos_totales})`,
      curso: {
        id: curso.id,
        nombre: curso.nombre,
        cupos_disponibles,
        cupos_totales: curso.cupos_totales,
        cupos_ocupados: curso.cupos_ocupados
      }
    });

  } catch (error: any) {
    console.error('[TOOL ERROR] validar_cupos:', error.message);
    
    if (error.response?.status === 404) {
      return JSON.stringify({
        success: false,
        valid: false,
        message: 'Curso no encontrado',
        curso_id: params.curso_id
      });
    }

    return JSON.stringify({
      success: false,
      valid: false,
      message: `Error al validar cupos: ${error.message}`,
      curso_id: params.curso_id
    });
  }
}

// Metadatos del tool para MCP
export const validarCuposMetadata = {
  name: 'validar_cupos',
  description: 'Valida si un curso tiene cupos disponibles. Verifica la existencia del curso y su disponibilidad.',
  inputSchema: {
    type: 'object',
    properties: {
      curso_id: {
        type: 'string',
        description: 'ID del curso a validar'
      }
    },
    required: ['curso_id']
  }
};
