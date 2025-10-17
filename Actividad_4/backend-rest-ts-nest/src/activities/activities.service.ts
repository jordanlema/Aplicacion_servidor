import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async create(createActividadDto: CreateActivityDto) {
    const actividad = await this.actividadRepository.save(createActividadDto);
    return actividad;
  }

  async findAll() {
    return this.actividadRepository.find({ relations: ['curso'] });
  }

  async findOne(id: string) {
    const actividad = await this.actividadRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['curso']
    });
    if (!actividad) 
      throw new NotFoundException(`La actividad con id ${id} no existe`);
    return actividad;
  }

  async update(id: string, updateActividadDto: Partial<CreateActivityDto>) {
    const actividad = await this.actividadRepository.findOneBy({ id: parseInt(id) });
    if (!actividad) 
      throw new NotFoundException(`La actividad con id ${id} no existe`);
    await this.actividadRepository.update(parseInt(id), updateActividadDto);
    return await this.actividadRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const actividad = await this.findOne(id);
    await this.actividadRepository.remove(actividad);
  }
}
