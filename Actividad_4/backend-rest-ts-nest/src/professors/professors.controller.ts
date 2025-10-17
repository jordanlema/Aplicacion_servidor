import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { CreateProfessorDto } from './dto/create-professor.dto';

@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Post()
  create(@Body() createProfesorDto: CreateProfessorDto) {
    return this.professorsService.create(createProfesorDto);
  }

  @Get()
  findAll() {
    return this.professorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfesorDto: Partial<CreateProfessorDto>) {
    return this.professorsService.update(id, updateProfesorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professorsService.remove(id);
  }
}
