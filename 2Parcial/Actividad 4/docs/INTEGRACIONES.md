# 🔗 Guía de Integraciones

Esta guía explica cómo integrar n8n con el backend existente (NestJS) y otros sistemas.

## 📋 Tabla de Contenidos

1. [Integración con Backend NestJS](#integración-con-backend-nestjs)
2. [Integración con MCP Server](#integración-con-mcp-server)
3. [Integración con API Gateway](#integración-con-api-gateway)
4. [Flujo End-to-End Completo](#flujo-end-to-end-completo)
5. [Patrones de Integración](#patrones-de-integración)

---

## 🔧 Integración con Backend NestJS

### Paso 1: Instalar Dependencias

En el microservicio que emitirá eventos (ej: `ms-inscripcion`):

```powershell
cd "Actividad 1/ms-inscripcion"
npm install @nestjs/axios axios
```

### Paso 2: Configurar HttpModule

**Archivo:** `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhookEmitterService } from './common/webhook-emitter.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    // ... otros imports
  ],
  providers: [
    WebhookEmitterService,
    // ... otros providers
  ],
})
export class AppModule {}
```

### Paso 3: Copiar WebhookEmitterService

El servicio ya fue creado en:
```
Actividad 1/ms-curso/src/common/webhook-emitter.service.ts
```

**Copia este archivo** a los microservicios que lo necesiten:
- `ms-inscripcion/src/common/`
- `ms-curso/src/common/`

### Paso 4: Configurar Variables de Entorno

**Archivo:** `.env` (en cada microservicio)

```env
# n8n Webhook Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Enable/Disable webhooks
WEBHOOKS_ENABLED=true
```

### Paso 5: Usar en tus Servicios

#### Ejemplo: Servicio de Inscripciones

**Archivo:** `src/inscripcion/inscripcion.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { WebhookEmitterService } from '../common/webhook-emitter.service';

@Injectable()
export class InscripcionService {
  constructor(
    private readonly webhookEmitter: WebhookEmitterService,
    // ... otros servicios
  ) {}

  async crearInscripcion(dto: CreateInscripcionDto) {
    // 1. Lógica de negocio
    const inscripcion = await this.inscripcionRepository.save({
      estudianteId: dto.estudianteId,
      cursoId: dto.cursoId,
      fecha: new Date(),
    });

    // 2. Obtener datos relacionados
    const curso = await this.cursoService.findOne(dto.cursoId);
    const estudiante = await this.estudianteService.findOne(dto.estudianteId);

    // 3. Emitir evento (asíncrono, no bloquea)
    this.webhookEmitter.emitInscripcionCreada({
      inscripcionId: inscripcion.id,
      cursoId: curso.id,
      cursoNombre: curso.nombre,
      estudianteNombre: estudiante.nombre,
      estudianteEmail: estudiante.email,
      fecha: inscripcion.fecha,
    });

    // 4. Retornar respuesta
    return inscripcion;
  }

  async cancelarInscripcion(id: string, motivo?: string) {
    const inscripcion = await this.inscripcionRepository.findOne(id);
    
    // Cambiar estado
    inscripcion.estado = 'CANCELADA';
    await this.inscripcionRepository.save(inscripcion);

    // Emitir evento
    const curso = await this.cursoService.findOne(inscripcion.cursoId);
    const estudiante = await this.estudianteService.findOne(inscripcion.estudianteId);

    this.webhookEmitter.emitInscripcionCancelada({
      inscripcionId: inscripcion.id,
      cursoId: curso.id,
      cursoNombre: curso.nombre,
      estudianteNombre: estudiante.nombre,
      motivo,
    });

    return inscripcion;
  }
}
```

#### Ejemplo: Servicio de Cursos

**Archivo:** `src/curso/curso.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { WebhookEmitterService } from '../common/webhook-emitter.service';

@Injectable()
export class CursoService {
  constructor(
    private readonly webhookEmitter: WebhookEmitterService,
  ) {}

  async verificarCupos(cursoId: string) {
    const curso = await this.cursoRepository.findOne(cursoId);
    const inscritos = await this.inscripcionRepository.count({
      where: { cursoId, estado: 'ACTIVA' },
    });

    // Si se llenaron los cupos, emitir alerta
    if (inscritos >= curso.cuposMaximos) {
      this.webhookEmitter.emitCuposAgotados({
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        cuposMaximos: curso.cuposMaximos,
        inscritosActuales: inscritos,
      });
    }

    return {
      disponible: inscritos < curso.cuposMaximos,
      cuposDisponibles: curso.cuposMaximos - inscritos,
    };
  }
}
```

### Paso 6: Manejo de Errores

El `WebhookEmitterService` está diseñado para NO interrumpir el flujo:

```typescript
private async enviarEvento(evento: any): Promise<void> {
  try {
    // Intenta enviar
    await this.httpService.post(url, evento).toPromise();
    this.logger.log('✅ Evento enviado');
  } catch (error) {
    // Si falla, solo logea pero NO lanza excepción
    this.logger.error('❌ Error al enviar evento');
    // El flujo principal continúa normalmente
  }
}
```

**Ventajas:**
- La aplicación no falla si n8n está caído
- Los eventos se pierden pero la funcionalidad core funciona
- Se puede implementar cola de retry más adelante

---

## 🌐 Integración con MCP Server

### Contexto

El MCP Server expone tools que son llamadas por Gemini. Algunas de estas tools pueden disparar eventos.

### Modificar Tools para Emitir Eventos

**Archivo:** `Actividad 3/mcp-server/src/tools/inscripcion.tool.ts`

```typescript
import axios from 'axios';

export class InscripcionTool {
  private readonly n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

  async inscribirEstudiante(params: {
    estudianteNombre: string;
    cursoNombre: string;
  }) {
    // 1. Llamar al backend
    const response = await axios.post('http://localhost:3002/inscripciones', {
      estudianteNombre: params.estudianteNombre,
      cursoNombre: params.cursoNombre,
    });

    // 2. El backend ya emitió el evento, pero podemos enviar uno adicional si queremos
    // (Opcional - normalmente el backend lo hace)
    
    return {
      success: true,
      inscripcion: response.data,
    };
  }
}
```

**Recomendación:** Deja que el backend emita los eventos. El MCP Server solo debe orquestar.

---

## 🚪 Integración con API Gateway

### Endpoint para Verificar n8n

**Archivo:** `Actividad 3/api-gateway/src/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(private readonly httpService: HttpService) {}

  @Get('n8n')
  async checkN8n() {
    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:5678/healthz', {
          timeout: 3000,
        }),
      );

      return {
        status: 'up',
        service: 'n8n',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        service: 'n8n',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

**Uso:**
```
GET http://localhost:3000/health/n8n
```

---

## 🔄 Flujo End-to-End Completo

### Escenario: Usuario crea inscripción por chat

```
┌──────────────────────────────────────────────────────────────────┐
│                          FLUJO COMPLETO                          │
└──────────────────────────────────────────────────────────────────┘

1. USUARIO (Chat)
   │
   │  "Inscribe a Juan Pérez en Programación Web"
   │
   ▼
2. API GATEWAY (Puerto 3000)
   │  - Recibe texto del usuario
   │  - Llama a Gemini
   │
   ▼
3. GEMINI (IA)
   │  - Interpreta intención
   │  - Decide tool: "inscribir_estudiante"
   │  - Extrae parámetros
   │
   ▼
4. MCP SERVER (Puerto 3001)
   │  - Recibe llamada de tool
   │  - Valida parámetros
   │  - Llama al backend
   │
   ▼
5. BACKEND NESTJS (Puerto 3002)
   │  - Valida datos
   │  - Guarda en base de datos
   │  - 🔥 EMITE EVENTO a n8n
   │  - Retorna confirmación
   │
   ├──────────────────┐
   │                  │
   ▼                  ▼
6a. RESPUESTA      6b. n8n (Puerto 5678)
    AL USUARIO         │
                       ├─→ Workflow 1: Notificación Telegram
                       │   ✅ Mensaje enviado
                       │
                       ├─→ Workflow 2: Google Sheets
                       │   📊 Registro agregado
                       │
                       └─→ Workflow 3: Evaluación de alertas
                           🔔 Sin alertas (cupos disponibles)
```

### Código Completo del Flujo

#### 1. Usuario envía mensaje

```typescript
// Frontend o CLI
const respuesta = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mensaje: 'Inscribe a Juan Pérez en Programación Web'
  })
});
```

#### 2. API Gateway procesa

```typescript
// api-gateway/src/chat/chat.controller.ts
@Post()
async chat(@Body() dto: ChatDto) {
  // Llama a Gemini con MCP
  const respuesta = await this.geminiService.processMessage(dto.mensaje);
  return respuesta;
}
```

#### 3. Gemini decide tool

```json
{
  "tool_call": {
    "name": "inscribir_estudiante",
    "parameters": {
      "estudiante_nombre": "Juan Pérez",
      "curso_nombre": "Programación Web"
    }
  }
}
```

#### 4. MCP Server ejecuta

```typescript
// mcp-server/src/tools/inscripcion.tool.ts
async execute(params) {
  const response = await axios.post('http://localhost:3002/inscripciones', {
    estudianteNombre: params.estudiante_nombre,
    cursoNombre: params.curso_nombre,
  });
  
  return response.data;
}
```

#### 5. Backend procesa y emite evento

```typescript
// ms-inscripcion/src/inscripcion/inscripcion.service.ts
async crear(dto) {
  // Guardar
  const inscripcion = await this.save(dto);
  
  // 🔥 EMITIR EVENTO
  await this.webhookEmitter.emitInscripcionCreada({
    inscripcionId: inscripcion.id,
    cursoId: curso.id,
    cursoNombre: curso.nombre,
    estudianteNombre: estudiante.nombre,
    estudianteEmail: estudiante.email,
    fecha: new Date(),
  });
  
  return inscripcion;
}
```

#### 6. n8n ejecuta workflows

Los 3 workflows reciben el evento simultáneamente:

```javascript
// Workflow 1: Notificación
POST /webhook/inscripcion.creada

// Workflow 2: Sheets
POST /webhook/eventos

// Workflow 3: Alertas
POST /webhook/alertas
```

---

## 🎯 Patrones de Integración

### Patrón 1: Fire and Forget

**Uso:** Eventos informativos que no requieren confirmación

```typescript
// No esperamos respuesta
this.webhookEmitter.emitInscripcionCreada(data);
// Continuamos inmediatamente
return inscripcion;
```

**Ventajas:**
- No bloquea el flujo
- Rápido

**Desventajas:**
- No sabemos si llegó
- No hay retry

### Patrón 2: Await Confirmation

**Uso:** Cuando necesitamos confirmar que n8n procesó el evento

```typescript
async emitInscripcionCreada(data) {
  const response = await firstValueFrom(
    this.httpService.post(url, data)
  );
  
  if (!response.data.success) {
    throw new Error('n8n rechazó el evento');
  }
  
  return response.data;
}
```

**Ventajas:**
- Confirmación de procesamiento
- Podemos manejar errores

**Desventajas:**
- Bloquea el flujo
- Acoplamiento más fuerte

### Patrón 3: Queue-Based (Avanzado)

**Uso:** Garantizar entrega con reintentos

```typescript
// Usar una cola (Redis, Bull, RabbitMQ)
await this.queue.add('webhook-event', {
  tipo: 'inscripcion.creada',
  datos: data,
  intentos: 0,
  maxIntentos: 3,
});
```

**Ventajas:**
- Garantiza entrega
- Reintentos automáticos
- No bloquea

**Desventajas:**
- Más complejidad
- Requiere infraestructura adicional

---

## 🧪 Pruebas de Integración

### Test 1: Backend → n8n

```typescript
// Archivo: ms-inscripcion/test/integration/webhook.spec.ts

describe('Webhook Integration', () => {
  let webhookEmitter: WebhookEmitterService;
  let n8nMock: MockAdapter;

  beforeEach(() => {
    n8nMock = new MockAdapter(axios);
  });

  it('debe enviar evento de inscripción creada', async () => {
    // Mock de n8n
    n8nMock
      .onPost('http://localhost:5678/webhook/inscripcion.creada')
      .reply(200, { success: true });

    // Ejecutar
    await webhookEmitter.emitInscripcionCreada({
      inscripcionId: '123',
      cursoNombre: 'Test',
      estudianteNombre: 'Juan',
      // ...
    });

    // Verificar
    expect(n8nMock.history.post).toHaveLength(1);
    expect(n8nMock.history.post[0].data).toContain('inscripcion.creada');
  });
});
```

### Test 2: Flujo End-to-End

```powershell
# Script de prueba completo
$headers = @{ "Content-Type" = "application/json" }

# 1. Crear inscripción via API Gateway
$body = @{
  mensaje = "Inscribe a Juan Pérez en Node.js"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/chat" `
  -Method POST `
  -Headers $headers `
  -Body $body

Write-Host "✅ Respuesta del Gateway: $($response.mensaje)"

# 2. Esperar procesamiento de n8n (2 segundos)
Start-Sleep -Seconds 2

# 3. Verificar Telegram (manual)
Write-Host "📱 Verifica Telegram para notificación"

# 4. Verificar Google Sheets (manual)
Write-Host "📊 Verifica Google Sheets para registro"

# 5. Verificar logs de n8n
docker-compose logs --tail=50 n8n | Select-String "inscripcion.creada"
```

---

## 🔒 Seguridad en Integraciones

### 1. Autenticación de Webhooks

**En n8n (receptor):**

Agrega un nodo "IF" que valida un token:

```javascript
// Validar header
{{ $json.headers.authorization === 'Bearer ' + $env.WEBHOOK_SECRET }}
```

**En Backend (emisor):**

```typescript
await this.httpService.post(url, evento, {
  headers: {
    'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
  },
});
```

### 2. Firma de Eventos (HMAC)

```typescript
import * as crypto from 'crypto';

function firmarEvento(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

// En Backend
const firma = firmarEvento(evento, process.env.WEBHOOK_SECRET);

await this.httpService.post(url, evento, {
  headers: {
    'X-Signature': firma,
  },
});

// En n8n, validar con Function node
const payload = JSON.stringify($json);
const secret = $env.WEBHOOK_SECRET;
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (expectedSignature !== $json.headers['x-signature']) {
  throw new Error('Firma inválida');
}

return $json;
```

### 3. Rate Limiting

```typescript
// En Backend, usar throttler
@Throttle(10, 60) // 10 llamadas por minuto
async emitirEvento() {
  // ...
}
```

---

## 📊 Monitoreo de Integraciones

### Métricas Importantes

1. **Tasa de éxito de webhooks**
   ```typescript
   // Contador de éxitos/fallos
   this.metricsService.increment('webhook.success');
   this.metricsService.increment('webhook.failure');
   ```

2. **Latencia promedio**
   ```typescript
   const start = Date.now();
   await enviarEvento();
   const duration = Date.now() - start;
   this.metricsService.timing('webhook.duration', duration);
   ```

3. **Eventos por tipo**
   ```typescript
   this.metricsService.increment(`webhook.${evento.tipo}`);
   ```

### Dashboard de Health Check

```typescript
@Get('status')
async getStatus() {
  return {
    backend: 'up',
    n8n: await this.checkN8n(),
    telegram: await this.checkTelegram(),
    sheets: await this.checkSheets(),
    timestamp: new Date().toISOString(),
  };
}
```

---

## 🎓 Mejores Prácticas

### ✅ DO

1. **Usa async/await** para emisión de eventos
2. **Logea todos los eventos** emitidos
3. **Maneja errores gracefully** (no crashes)
4. **Valida payloads** antes de enviar
5. **Documenta los contratos** de eventos
6. **Versiona tus eventos** (`version: "1.0"`)

### ❌ DON'T

1. **No bloquees el flujo principal** esperando webhooks
2. **No envíes datos sensibles** (passwords, tokens)
3. **No asumas que n8n está disponible** 24/7
4. **No reenvíes eventos duplicados** sin idempotencia
5. **No ignores los errores** completamente

---

## 📚 Recursos Adicionales

- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [NestJS HttpModule](https://docs.nestjs.com/techniques/http-module)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)

---

## 🆘 Troubleshooting

### Webhook no recibe eventos

1. Verifica que n8n esté corriendo: `docker-compose ps`
2. Verifica la URL: `N8N_WEBHOOK_URL` en .env
3. Verifica que el workflow esté activo
4. Revisa logs: `docker-compose logs -f n8n`

### Backend no envía eventos

1. Verifica que `WebhookEmitterService` esté en providers
2. Verifica que `HttpModule` esté importado
3. Revisa logs del backend
4. Verifica que la URL de n8n sea accesible

### Eventos llegan pero workflows no ejecutan

1. Verifica que el tipo de evento coincida
2. Verifica que las condiciones IF sean correctas
3. Revisa ejecuciones en n8n (Executions tab)
4. Verifica credenciales de integraciones (Telegram, Sheets, etc.)
