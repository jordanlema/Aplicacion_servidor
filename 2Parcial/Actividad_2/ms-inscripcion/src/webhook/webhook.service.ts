import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as https from 'https';
import * as http from 'http';

interface WebhookPayload {
  event: string;
  version: string;
  id: string;
  idempotency_key: string;
  timestamp: string;
  data: any;
  metadata: {
    source: string;
    environment: string;
    correlation_id: string;
  };
}

interface WebhookDeliveryLog {
  webhook_id: string;
  event_type: string;
  url: string;
  attempt: number;
  status_code?: number;
  success: boolean;
  response?: string;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class WebhookService {
  private readonly SECRET_KEY = process.env.WEBHOOK_SECRET || 'dev-secret-key-change-in-production';
  private readonly deliveryLogs: WebhookDeliveryLog[] = [];

  /**
   * Genera firma HMAC-SHA256 para el payload
   */
  private generateSignature(payload: string, timestamp: string): string {
    const signedPayload = `${timestamp}.${payload}`;
    return createHmac('sha256', this.SECRET_KEY)
      .update(signedPayload)
      .digest('hex');
  }

  /**
   * Construye el payload estándar según especificación PDF
   */
  private buildPayload(
    eventType: string,
    data: any,
    idempotencyKey: string,
  ): WebhookPayload {
    return {
      event: eventType,
      version: '1.0',
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: 'microservice-inscripcion',
        environment: process.env.NODE_ENV || 'development',
        correlation_id: `req_${Math.random().toString(36).substr(2, 9)}`,
      },
    };
  }

  /**
   * Envía el webhook con firma HMAC a la URL destino
   */
  private async sendWebhook(
    url: string,
    payload: WebhookPayload,
    attempt: number = 1,
  ): Promise<WebhookDeliveryLog> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, timestamp);

    const log: WebhookDeliveryLog = {
      webhook_id: payload.id,
      event_type: payload.event,
      url,
      attempt,
      success: false,
      timestamp: new Date(),
    };

    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const response = await new Promise<{ statusCode: number; body: string }>(
        (resolve, reject) => {
          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payloadString),
              'X-Webhook-Signature': signature,
              'X-Webhook-Timestamp': timestamp,
              'X-Webhook-Id': payload.id,
              'X-Idempotency-Key': payload.idempotency_key,
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
            },
          };

          const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () =>
              resolve({ statusCode: res.statusCode || 0, body }),
            );
          });

          req.on('error', reject);
          req.write(payloadString);
          req.end();
        },
      );

      log.status_code = response.statusCode;
      log.success = response.statusCode >= 200 && response.statusCode < 300;
      log.response = response.body;

      console.log(
        `📤 Webhook enviado: ${payload.event} | Status: ${response.statusCode} | URL: ${url}`,
      );

      if (!log.success) {
        console.warn(
          `⚠️  Webhook falló con status ${response.statusCode}: ${response.body}`,
        );
      }
    } catch (error) {
      log.error = error.message;
      log.success = false;
      console.error(`❌ Error enviando webhook: ${error.message}`);
    }

    this.deliveryLogs.push(log);
    return log;
  }

  /**
   * Publica evento enrollment.created
   */
  async publishEnrollmentCreated(inscripcion: {
    id: string;
    curso_id: string;
    estudiante_nombre: string;
    estudiante_email: string;
    status: string;
  }): Promise<void> {
    const idempotencyKey = `enrollment-${inscripcion.id}-created`;
    const payload = this.buildPayload(
      'enrollment.created',
      {
        enrollment_id: inscripcion.id,
        student_name: inscripcion.estudiante_nombre,
        student_email: inscripcion.estudiante_email,
        course_id: inscripcion.curso_id,
        status: inscripcion.status,
      },
      idempotencyKey,
    );

    console.log('\n🌐 Publicando Webhook: enrollment.created');
    console.log(`   ID: ${payload.id}`);
    console.log(`   Idempotency Key: ${idempotencyKey}`);

    // Obtener URLs de Edge Functions desde variables de entorno
    const eventLoggerUrl = process.env.EDGE_FUNCTION_EVENT_LOGGER_URL;
    const notifierUrl = process.env.EDGE_FUNCTION_NOTIFIER_URL;

    if (eventLoggerUrl) {
      await this.sendWebhook(eventLoggerUrl, payload);
    } else {
      console.warn('⚠️  EDGE_FUNCTION_EVENT_LOGGER_URL no configurada');
    }

    if (notifierUrl) {
      await this.sendWebhook(notifierUrl, payload);
    } else {
      console.warn('⚠️  EDGE_FUNCTION_NOTIFIER_URL no configurada');
    }
  }

  /**
   * Obtiene logs de entrega de webhooks (para observabilidad)
   */
  getDeliveryLogs(): WebhookDeliveryLog[] {
    return this.deliveryLogs;
  }

  /**
   * Obtiene estadísticas de entrega
   */
  getDeliveryStats() {
    const total = this.deliveryLogs.length;
    const successful = this.deliveryLogs.filter((l) => l.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      success_rate: total > 0 ? (successful / total) * 100 : 0,
    };
  }
}
