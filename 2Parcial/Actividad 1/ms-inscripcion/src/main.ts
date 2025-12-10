import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el Gateway
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
  console.log('📚 ms-inscripcion running on port 3002');
  console.log('✅ Idempotent Consumer con Redis activado');
  console.log('🔗 Comunicación con ms-curso vía RabbitMQ');
}
bootstrap();
