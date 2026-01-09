import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';

/**
 * Cliente MCP que conecta con el MCP Server
 * 
 * Responsabilidades:
 * - Establecer conexión con el MCP Server vía stdio
 * - Listar los tools disponibles
 * - Ejecutar tools cuando se necesiten
 */

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private isConnected = false;

  async onModuleInit() {
    // Iniciar conexión en background sin bloquear
    this.connect().catch(err => {
      console.error('[MCP Client] ❌ Error inicial al conectar:', err.message);
      console.log('[MCP Client] Se reintentará en el primer uso');
    });
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      console.log('[MCP Client] Conectando al MCP Server...');

      // Crear cliente MCP
      this.client = new Client(
        {
          name: 'api-gateway-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      // Determinar ruta al servidor MCP según el entorno
      let serverScript: string;
      let mcpServerPath: string;

      if (process.env.MCP_SERVER_PATH) {
        // Ruta personalizada (para Docker)
        serverScript = process.env.MCP_SERVER_PATH;
        mcpServerPath = path.dirname(serverScript);
      } else {
        // Ruta local (desarrollo) - desde api-gateway/dist/mcp-client/ subir 3 niveles
        mcpServerPath = path.join(__dirname, '../../../mcp-server');
        serverScript = path.join(mcpServerPath, 'dist', 'server.js');
      }

      console.log(`[MCP Client] Servidor MCP: ${serverScript}`);

      // Conectar cliente con transporte stdio
      console.log('[MCP Client] Creando transporte stdio...');
      const transport = new StdioClientTransport({
        command: 'node',
        args: [serverScript],
        env: {
          ...process.env,
          BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
          INSCRIPCION_URL: process.env.INSCRIPCION_URL || 'http://localhost:3002',
        },
      });

      // Agregar listener de errores al transporte
      transport.onerror = (error) => {
        console.error('[MCP Client] ❌ Error en transporte:', error);
      };

      console.log('[MCP Client] Intentando conectar...');
      try {
        await this.client.connect(transport);
        console.log('[MCP Client] Conexión establecida, marcando como conectado...');
        this.isConnected = true;
      } catch (connectError) {
        console.error('[MCP Client] ❌ Error específico en connect():', connectError);
        console.error('[MCP Client] Stack:', connectError.stack);
        throw connectError;
      }

      console.log('[MCP Client] ✅ Conectado exitosamente');

      // Listar tools disponibles
      const tools = await this.listTools();
      console.log(`[MCP Client] 📋 Tools disponibles: ${tools.map((t) => t.name).join(', ')}`);
    } catch (error) {
      console.error('[MCP Client] ❌ Error al conectar:', error);
      throw error;
    }
  }

  private async disconnect() {
    if (this.client) {
      await this.client.close();
    }
    this.isConnected = false;
    console.log('[MCP Client] 🔌 Desconectado');
  }

  /**
   * Lista todos los tools disponibles en el MCP Server
   */
  async listTools() {
    if (!this.isConnected) {
      throw new Error('MCP Client no está conectado');
    }

    const response = await this.client.listTools();
    return response.tools;
  }

  /**
   * Ejecuta un tool específico con los parámetros dados
   */
  async callTool(toolName: string, args: Record<string, any>) {
    if (!this.isConnected) {
      throw new Error('MCP Client no está conectado');
    }

    console.log(`[MCP Client] 🔧 Ejecutando tool: ${toolName}`);
    console.log(`[MCP Client] 📝 Args: ${JSON.stringify(args)}`);

    const response = await this.client.callTool({
      name: toolName,
      arguments: args,
    });

    return response;
  }

  /**
   * Verifica si el cliente está conectado
   */
  get connected(): boolean {
    return this.isConnected;
  }
}
