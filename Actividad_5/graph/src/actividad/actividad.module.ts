import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { ActividadResolver } from './actividad.resolver';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttp } from 'src/servicios/http.service';

@Module({
  imports: [HttpModule],
  providers: [ActividadResolver, ActividadService, ServiceHttp],
})
export class ActividadModule {}
