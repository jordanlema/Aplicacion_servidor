import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepository: Repository<Certificado>,
  ) {}

  async create(createCertificadoDto: CreateCertificateDto) {
    const certificado = await this.certificadoRepository.save(createCertificadoDto);
    return certificado;
  }

  async findAll() {
    return this.certificadoRepository.find({ relations: ['usuario', 'curso'] });
  }

  async findOne(id: string) {
    const certificado = await this.certificadoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['usuario', 'curso']
    });
    if (!certificado) 
      throw new NotFoundException(`El certificado con id ${id} no existe`);
    return certificado;
  }

  async update(id: string, updateCertificadoDto: Partial<CreateCertificateDto>) {
    const certificado = await this.certificadoRepository.findOneBy({ id: parseInt(id) });
    if (!certificado) 
      throw new NotFoundException(`El certificado con id ${id} no existe`);
    await this.certificadoRepository.update(parseInt(id), updateCertificadoDto);
    return await this.certificadoRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const certificado = await this.findOne(id);
    await this.certificadoRepository.remove(certificado);
  }
}
