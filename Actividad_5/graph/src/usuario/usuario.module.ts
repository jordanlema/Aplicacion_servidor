import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioResolver } from './usuario.resolver';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttp } from 'src/servicios/http.service';

@Module({
  imports: [HttpModule],
  providers: [UsuarioResolver, UsuarioService, ServiceHttp],
})
export class UsuarioModule {}
