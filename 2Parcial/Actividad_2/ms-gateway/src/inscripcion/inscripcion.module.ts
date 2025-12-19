import { Module } from '@nestjs/common';
import { InscripcionController } from './inscripcion.controller';

@Module({
  controllers: [InscripcionController],
})
export class InscripcionModule {}
