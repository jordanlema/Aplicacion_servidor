import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pregunta } from './entities/pregunta.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Pregunta)
    private readonly preguntaRepository: Repository<Pregunta>,
  ) {}

  async create(createPreguntaDto: CreateQuestionDto) {
    const pregunta = await this.preguntaRepository.save(createPreguntaDto);
    return pregunta;
  }

  async findAll() {
    return this.preguntaRepository.find();
  }

  async findOne(id: string) {
    const pregunta = await this.preguntaRepository.findOneBy({ id: parseInt(id) });
    if (!pregunta) 
      throw new NotFoundException(`La pregunta con id ${id} no existe`);
    return pregunta;
  }

  async update(id: string, updatePreguntaDto: Partial<CreateQuestionDto>) {
    const pregunta = await this.preguntaRepository.findOneBy({ id: parseInt(id) });
    if (!pregunta) 
      throw new NotFoundException(`La pregunta con id ${id} no existe`);
    await this.preguntaRepository.update(parseInt(id), updatePreguntaDto);
    return await this.preguntaRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const pregunta = await this.findOne(id);
    await this.preguntaRepository.remove(pregunta);
  }
}
