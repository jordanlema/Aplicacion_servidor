import { Module } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { ProfesorResolver } from './profesor.resolver';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttp } from 'src/servicios/http.service';

@Module({
  imports: [HttpModule],
  providers: [ProfesorResolver, ProfesorService, ServiceHttp],
})
export class ProfesorModule {}
