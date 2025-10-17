import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificado } from './entities/certificado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado])],
  providers: [CertificatesService],
  controllers: [CertificatesController]
})
export class CertificatesModule {}
