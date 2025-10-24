import { Injectable } from '@nestjs/common';
import { CreateCursoInput } from './dto/create-curso.input';
import { UpdateCursoInput } from './dto/update-curso.input';

@Injectable()
export class CursoService {
  create(createCursoInput: CreateCursoInput) {
    return 'This action adds a new curso';
  }

  findAll() {
    return `This action returns all curso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} curso`;
  }

  update(id: number, updateCursoInput: UpdateCursoInput) {
    return `This action updates a #${id} curso`;
  }

  remove(id: number) {
    return `This action removes a #${id} curso`;
  }
}
