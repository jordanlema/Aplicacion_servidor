import { z } from 'zod';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Schema de entrada para el tool
export const BuscarCursoSchema = z.object({
  nombre: z.string().describe('Nombre del curso a buscar')
});

// Schema de salida
export const CursoOutputSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  cupos_disponibles: z.number(),
  cupos_totales: z.number()
});

export type BuscarCursoInput = z.infer<typeof BuscarCursoSchema>;
export type CursoOutput = z.infer<typeof CursoOutputSchema>;

/**
 * TOOL 1: Buscar Curso
 * Tipo: 🔍 Búsqueda
 * 
 * Permite buscar cursos por nombre en el sistema.
 * Devuelve información básica del curso incluyendo cupos disponibles.
 */
export async function buscarCurso(params: BuscarCursoInput): Promise<string> {
  try {
    console.error(`[TOOL] Buscando curso: ${params.nombre}`);
    
    // Llamar al backend REST
    const response = await axios.get(`${BACKEND_URL}/cursos`, {
      params: { nombre: params.nombre }
    });

    const cursos = response.data;

    if (!cursos || cursos.length === 0) {
      return JSON.stringify({
        success: false,
        message: `No se encontró ningún curso con el nombre "${params.nombre}"`,
        cursos: []
      });
    }

    // Formatear respuesta con información relevante
    const cursosFormateados = cursos.map((curso: any) => ({
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      cupos_disponibles: curso.cupos_totales - curso.cupos_ocupados,
      cupos_totales: curso.cupos_totales,
      tiene_cupos: (curso.cupos_totales - curso.cupos_ocupados) > 0
    }));

    return JSON.stringify({
      success: true,
      message: `Se encontraron ${cursosFormateados.length} curso(s)`,
      cursos: cursosFormateados
    });

  } catch (error: any) {
    console.error('[TOOL ERROR] buscar_curso:', error.message);
    return JSON.stringify({
      success: false,
      message: `Error al buscar curso: ${error.message}`,
      cursos: []
    });
  }
}

// Metadatos del tool para MCP
export const buscarCursoMetadata = {
  name: 'buscar_curso',
  description: 'Busca cursos disponibles por nombre. Devuelve información del curso incluyendo cupos disponibles.',
  inputSchema: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre del curso a buscar (búsqueda parcial permitida)'
      }
    },
    required: ['nombre']
  }
};
