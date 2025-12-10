import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CursoController } from './curso.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CURSO_PUBLISHER',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'curso_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [CursoController],
})
export class CursoModule {}
