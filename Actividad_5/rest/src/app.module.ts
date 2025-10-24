import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { CursoModule } from './curso/curso.module';
import { ProfesorModule } from './profesor/profesor.module';
import { ActividadModule } from './actividad/actividad.module';

@Module({
  imports: [UsuarioModule, CursoModule, ProfesorModule, ActividadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
