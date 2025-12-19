import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InscripcionController } from './inscripcion/inscripcion.controller';
import { InscripcionService } from './inscripcion/inscripcion.service';
import { Inscripcion } from './inscripcion/inscripcion.entity';
import { RedisService } from './redis/redis.service';
import { WebhookService } from './webhook/webhook.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5433'),
      username: 'pguser',
      password: 'pgpass',
      database: 'inscripcion_db',
      entities: [Inscripcion],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Inscripcion]),
    ClientsModule.register([
      {
        name: 'CURSO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'curso_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController, InscripcionController],
  providers: [AppService, InscripcionService, RedisService, WebhookService],
})
export class AppModule {}
