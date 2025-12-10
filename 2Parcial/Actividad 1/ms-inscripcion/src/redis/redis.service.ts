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
      console.log('✅ Conectado a Redis (ms-inscripcion)');
    });

    this.client.on('error', (err) => {
      console.error('❌ Error de Redis:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async isMessageProcessed(messageId: string): Promise<boolean> {
    const exists = await this.client.exists(`inscripcion:${messageId}`);
    return exists === 1;
  }

  async markMessageAsProcessed(messageId: string, ttl: number = 86400): Promise<void> {
    await this.client.setex(`inscripcion:${messageId}`, ttl, Date.now().toString());
  }

  async tryRegisterMessage(messageId: string, ttl: number = 86400): Promise<boolean> {
    const result = await this.client.set(
      `inscripcion:${messageId}`,
      Date.now().toString(),
      'EX',
      ttl,
      'NX',
    );
    return result === 'OK';
  }
}
