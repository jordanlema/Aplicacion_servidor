import { Module } from '@nestjs/common';
import { InscripcionController } from './inscripcion.controller';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  controllers: [InscripcionController],
})
export class InscripcionModule {}
