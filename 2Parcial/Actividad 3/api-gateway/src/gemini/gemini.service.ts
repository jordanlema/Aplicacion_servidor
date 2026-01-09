import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { McpClientService } from '../mcp-client/mcp-client.service';

/**
 * Servicio de Gemini con Function Calling
 * 
 * Orquesta la interacción entre:
 * - Usuario (lenguaje natural)
 * - Gemini (decisiones de qué hacer)
 * - MCP Server (ejecución de acciones)
 */

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private mcpClient: McpClientService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Inicialización lazy - se hará en el primer request
  }

  private async initializeModel() {
    if (this.model) {
      return; // Ya está inicializado
    }
    // Obtener tools del MCP Server
    const mcpTools = await this.mcpClient.listTools();

    // Convertir tools MCP a formato Gemini
    const geminiTools = mcpTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: tool.inputSchema.properties,
        required: tool.inputSchema.required || [],
      },
    }));

    console.log('[Gemini] 🤖 Inicializando modelo con tools:', geminiTools.map(t => t.name).join(', '));

    // Crear modelo con function calling
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ functionDeclarations: geminiTools }],
    });
  }

  /**
   * Procesa una solicitud en lenguaje natural
   * 
   * Flujo:
   * 1. Usuario envía texto ("Inscribe a Juan en Programación Web")
   * 2. Gemini decide qué tools ejecutar
   * 3. Ejecutamos los tools vía MCP
   * 4. Enviamos resultados a Gemini
   * 5. Gemini genera respuesta final para el usuario
   */
  async processRequest(userMessage: string): Promise<string> {
    try {
      // MODO DEMO: Simular IA sin llamar a Gemini (para evitar problemas de cuota)
      if (process.env.DEMO_MODE === 'true') {
        return await this.processDemoMode(userMessage);
      }

      // Inicializar modelo si no está listo
      await this.initializeModel();
      
      console.log(`[Gemini] 💬 Usuario: ${userMessage}`);

      const chat = this.model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      // Iterar mientras Gemini solicite function calls
      let iterations = 0;
      const MAX_ITERATIONS = 10;

      while (iterations < MAX_ITERATIONS) {
        const functionCalls = response.functionCalls();

        if (!functionCalls || functionCalls.length === 0) {
          // No hay más function calls, obtener respuesta final
          const finalText = response.text();
          console.log(`[Gemini] ✅ Respuesta final: ${finalText}`);
          return finalText;
        }

        console.log(`[Gemini] 🔧 Ejecutando ${functionCalls.length} function call(s)...`);

        // Ejecutar todos los function calls solicitados
        const functionResponses = [];

        for (const call of functionCalls) {
          console.log(`[Gemini] → ${call.name}(${JSON.stringify(call.args)})`);

          try {
            // Ejecutar tool vía MCP
            const toolResult = await this.mcpClient.callTool(call.name, call.args);
            
            // Extraer contenido de texto del resultado MCP
            const content = toolResult.content as Array<{ type: string; text?: string }>;
            const textContent = content.find((c) => c.type === 'text');
            const resultText = textContent?.text || '{}';

            console.log(`[Gemini] ← Resultado: ${resultText.substring(0, 100)}...`);

            functionResponses.push({
              name: call.name,
              response: JSON.parse(resultText),
            });
          } catch (error) {
            console.error(`[Gemini] ❌ Error ejecutando ${call.name}:`, error.message);
            functionResponses.push({
              name: call.name,
              response: { success: false, error: error.message },
            });
          }
        }

        // Enviar resultados de vuelta a Gemini
        result = await chat.sendMessage(
          functionResponses.map((fr) => ({
            functionResponse: {
              name: fr.name,
              response: fr.response,
            },
          }))
        );

        response = result.response;
        iterations++;
      }

      // Si llegamos al límite de iteraciones
      console.warn('[Gemini] ⚠ Se alcanzó el límite de iteraciones');
      return response.text() || 'No se pudo completar la solicitud después de múltiples intentos.';

    } catch (error) {
      console.error('[Gemini] ❌ Error:', error);
      throw error;
    }
  }

  /**
   * Modo demo que simula el comportamiento de la IA
   */
  private async processDemoMode(userMessage: string): Promise<string> {
    console.log(`[Gemini DEMO] 💬 Usuario: ${userMessage}`);
    console.log(`[Gemini DEMO] 🤖 Simulando flujo de IA...`);

    // Extraer el ID del estudiante del mensaje
    const estudianteMatch = userMessage.match(/estudiante\s+ID\s+(\d+)/i);
    const estudianteId = estudianteMatch ? estudianteMatch[1] : '1';

    // Simular el flujo: buscar curso → validar cupos → crear inscripción
    try {
      // 1. Buscar curso
      console.log(`[Gemini DEMO] 🔍 Buscando curso "Node.js"...`);
      const buscarResult = await this.mcpClient.callTool('buscar_curso', { nombre: 'Node.js' });
      const buscarData = JSON.parse(buscarResult.content[0].text);
      const cursos = buscarData.cursos || buscarData;
      
      if (!cursos || cursos.length === 0) {
        return '❌ No se encontró ningún curso con ese nombre.';
      }

      const curso = cursos[0];
      console.log(`[Gemini DEMO] ✅ Curso encontrado: ${curso.nombre} (ID: ${curso.id})`);

      // 2. Validar cupos
      console.log(`[Gemini DEMO] 🔍 Validando cupos disponibles...`);
      const validarResult = await this.mcpClient.callTool('validar_cupos', { curso_id: curso.id });
      const validacion = JSON.parse(validarResult.content[0].text);

      if (!validacion.valid) {
        return `❌ El curso "${curso.nombre}" no tiene cupos disponibles. Cupos totales: ${validacion.curso?.cupos_totales || 'N/A'}, Inscritos: ${validacion.curso?.cupos_ocupados || 'N/A'}.`;
      }

      console.log(`[Gemini DEMO] ✅ Hay ${validacion.curso.cupos_disponibles} cupos disponibles`);

      // 3. Crear inscripción
      console.log(`[Gemini DEMO] 📝 Creando inscripción...`);
      const inscribirResult = await this.mcpClient.callTool('crear_inscripcion', {
        estudiante: estudianteId,
        curso_id: curso.id
      });
      
      const inscripcion = JSON.parse(inscribirResult.content[0].text);
      
      return `✅ ¡Inscripción exitosa!

📚 **Curso:** ${curso.nombre}
👤 **Estudiante ID:** ${estudianteId}
📅 **Fecha:** ${inscripcion.inscripcion.fecha}
🎫 **ID Inscripción:** ${inscripcion.inscripcion.id}

El curso tiene ${validacion.curso.cupos_disponibles - 1} cupos disponibles restantes.`;

    } catch (error) {
      console.error('[Gemini DEMO] ❌ Error:', error);
      return `❌ Error al procesar la inscripción: ${error.message}`;
    }
  }

  /**
   * Verifica el estado del servicio
   */
  async healthCheck(): Promise<{ status: string; model: string; tools: number }> {
    const tools = await this.mcpClient.listTools();
    return {
      status: 'ok',
      model: 'gemini-1.5-flash',
      tools: tools.length,
    };
  }
}
