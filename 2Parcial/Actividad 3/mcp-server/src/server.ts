#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getToolsList, executeTool } from './tools/registry.js';

/**
 * MCP SERVER - Gestión de Inscripciones a Cursos
 * 
 * Este servidor expone 3 tools que permiten a una IA gestionar
 * inscripciones de estudiantes a cursos:
 * 
 * 1. buscar_curso: Busca cursos por nombre
 * 2. validar_cupos: Verifica disponibilidad de cupos
 * 3. crear_inscripcion: Registra la inscripción
 * 
 * Protocolo: JSON-RPC 2.0 sobre stdio
 * Transporte: StdioServerTransport (entrada/salida estándar)
 */

class InscripcionMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'inscripcion-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // Handler: Listar tools disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = getToolsList();
      console.error(`[MCP] Cliente solicita lista de tools: ${tools.length} disponibles`);
      
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    // Handler: Ejecutar un tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      console.error(`[MCP] Ejecutando tool: ${name}`);
      console.error(`[MCP] Parámetros: ${JSON.stringify(args, null, 2)}`);

      try {
        const result = await executeTool(name, args || {});
        
        console.error(`[MCP] Tool ${name} ejecutado exitosamente`);
        
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      } catch (error: any) {
        console.error(`[MCP ERROR] Error ejecutando ${name}:`, error.message);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message
              })
            }
          ],
          isError: true
        };
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP ERROR] Error del servidor:', error);
    };

    process.on('SIGINT', async () => {
      console.error('[MCP] Cerrando servidor...');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    
    console.error('[MCP] 🚀 Servidor MCP iniciado');
    console.error('[MCP] 📋 Tools disponibles: buscar_curso, validar_cupos, crear_inscripcion');
    console.error('[MCP] 🔌 Transporte: stdio (JSON-RPC 2.0)');
    console.error('[MCP] ⏳ Esperando conexiones...');
    
    await this.server.connect(transport);
  }
}

// Iniciar servidor
const server = new InscripcionMCPServer();
server.run().catch((error) => {
  console.error('[MCP FATAL]', error);
  process.exit(1);
});
