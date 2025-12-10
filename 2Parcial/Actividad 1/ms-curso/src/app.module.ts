import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Curso } from './curso/curso.entity';
import { CursoConsumer } from './curso/curso.consumer';
import { CursoService } from './curso/curso.service';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5434'),
      username: 'pguser',
      password: 'pgpass',
      database: 'curso_db',
      entities: [Curso],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Curso]),
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
  controllers: [AppController, CursoConsumer],
  providers: [AppService, CursoService, RedisService],
})
export class AppModule {}
