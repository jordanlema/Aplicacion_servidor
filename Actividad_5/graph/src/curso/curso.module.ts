import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoResolver } from './curso.resolver';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttp } from 'src/servicios/http.service';

@Module({
  imports: [HttpModule],
  providers: [CursoResolver, CursoService, ServiceHttp],
})
export class CursoModule {}
