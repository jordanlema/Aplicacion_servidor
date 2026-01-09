import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          🚀 API GATEWAY - TALLER 3 MCP                    ║');
  console.log('║          Gestión de Inscripciones con IA                  ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Servidor corriendo en: http://localhost:${port}`);
  console.log('');
  console.log('📌 Endpoints disponibles:');
  console.log(`   POST http://localhost:${port}/inscripcion/process`);
  console.log(`   GET  http://localhost:${port}/inscripcion/health`);
  console.log('');
  console.log('💡 Ejemplo de uso:');
  console.log('   curl -X POST http://localhost:3000/inscripcion/process \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"message": "Inscribe a Juan Pérez en Programación Web"}\'');
  console.log('');
}

bootstrap();
