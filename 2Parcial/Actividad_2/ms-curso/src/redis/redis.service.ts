import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Conectado a Redis');
    });

    this.client.on('error', (err) => {
      console.error('❌ Error de Redis:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Verifica si un mensaje ya fue procesado (idempotencia)
   * @param messageId ID único del mensaje
   * @returns true si ya fue procesado, false si es nuevo
   */
  async isMessageProcessed(messageId: string): Promise<boolean> {
    const exists = await this.client.exists(`processed:${messageId}`);
    return exists === 1;
  }

  /**
   * Marca un mensaje como procesado
   * @param messageId ID único del mensaje
   * @param ttl Tiempo de vida en segundos (default: 24 horas)
   */
  async markMessageAsProcessed(messageId: string, ttl: number = 86400): Promise<void> {
    await this.client.setex(`processed:${messageId}`, ttl, Date.now().toString());
  }

  /**
   * Intenta registrar un mensaje de forma atómica
   * @param messageId ID único del mensaje
   * @returns true si se registró exitosamente (mensaje nuevo), false si ya existía
   */
  async tryRegisterMessage(messageId: string, ttl: number = 86400): Promise<boolean> {
    const result = await this.client.set(
      `processed:${messageId}`,
      Date.now().toString(),
      'EX',
      ttl,
      'NX', // Solo establece si NO existe
    );
    return result === 'OK';
  }
}
