import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { CursoService } from './curso/curso.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cursoService: CursoService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cursos')
  async getCursos() {
    return this.cursoService.findAll();
  }

  @Get('cursos/:id')
  async getCursoById(@Param('id') id: string) {
    const curso = await this.cursoService.findById(id);
    if (!curso) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return curso;
  }
}
