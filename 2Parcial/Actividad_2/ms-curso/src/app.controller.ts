import { Controller, Get } from '@nestjs/common';
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
}
