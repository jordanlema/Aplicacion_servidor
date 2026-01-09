import { buscarCurso, buscarCursoMetadata } from './buscar-curso.tool.js';
import { validarCupos, validarCuposMetadata } from './validar-cupos.tool.js';
import { crearInscripcion, crearInscripcionMetadata } from './crear-inscripcion.tool.js';

/**
 * Registro central de todos los tools disponibles en el MCP Server.
 * 
 * Cada tool debe tener:
 * - metadata: información para que la IA sepa cuándo y cómo usarlo
 * - handler: función que ejecuta la lógica del tool
 */

export interface ToolDefinition {
  metadata: {
    name: string;
    description: string;
    inputSchema: any;
  };
  handler: (params: any) => Promise<string>;
}

export const TOOLS: Record<string, ToolDefinition> = {
  buscar_curso: {
    metadata: buscarCursoMetadata,
    handler: buscarCurso
  },
  validar_cupos: {
    metadata: validarCuposMetadata,
    handler: validarCupos
  },
  crear_inscripcion: {
    metadata: crearInscripcionMetadata,
    handler: crearInscripcion
  }
};

/**
 * Obtiene la lista de metadatos de todos los tools disponibles.
 * Esta función es usada por el MCP Server para responder a tools/list.
 */
export function getToolsList() {
  return Object.values(TOOLS).map(tool => tool.metadata);
}

/**
 * Ejecuta un tool por su nombre.
 */
export async function executeTool(toolName: string, params: any): Promise<string> {
  const tool = TOOLS[toolName];
  
  if (!tool) {
    throw new Error(`Tool desconocido: ${toolName}`);
  }

  return await tool.handler(params);
}
