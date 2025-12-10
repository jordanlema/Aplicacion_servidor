import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursoModule } from './curso/curso.module';
import { InscripcionModule } from './inscripcion/inscripcion.module';

@Module({
  imports: [
    CursoModule,
    InscripcionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
