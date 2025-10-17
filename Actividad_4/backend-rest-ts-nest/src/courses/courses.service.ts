import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async create(createCursoDto: CreateCourseDto) {
    const curso = await this.cursoRepository.save(createCursoDto);
    return curso;
  }

  async findAll() {
    return this.cursoRepository.find({ relations: ['profesor', 'actividades'] });
  }

  async findOne(id: string) {
    const curso = await this.cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['profesor', 'actividades', 'certificados']
    });
    if (!curso) 
      throw new NotFoundException(`El curso con id ${id} no existe`);
    return curso;
  }

  async update(id: string, updateCursoDto: Partial<CreateCourseDto>) {
    const curso = await this.cursoRepository.findOneBy({ id: parseInt(id) });
    if (!curso) 
      throw new NotFoundException(`El curso con id ${id} no existe`);
    await this.cursoRepository.update(parseInt(id), updateCursoDto);
    return await this.cursoRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const curso = await this.findOne(id);
    await this.cursoRepository.remove(curso);
  }
}
