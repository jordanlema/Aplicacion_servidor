import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';

@Injectable()
export class ProfessorsService {
  constructor(
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
  ) {}

  async create(createProfesorDto: CreateProfessorDto) {
    const profesor = await this.profesorRepository.save(createProfesorDto);
    return profesor;
  }

  async findAll() {
    return this.profesorRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: string) {
    const profesor = await this.profesorRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['usuario', 'cursos']
    });
    if (!profesor) 
      throw new NotFoundException(`El profesor con id ${id} no existe`);
    return profesor;
  }

  async update(id: string, updateProfesorDto: Partial<CreateProfessorDto>) {
    const profesor = await this.profesorRepository.findOneBy({ id: parseInt(id) });
    if (!profesor) 
      throw new NotFoundException(`El profesor con id ${id} no existe`);
    await this.profesorRepository.update(parseInt(id), updateProfesorDto);
    return await this.profesorRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const profesor = await this.findOne(id);
    await this.profesorRepository.remove(profesor);
  }
}
