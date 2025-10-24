import { Injectable } from '@nestjs/common';
import { CreateProfesorInput } from './dto/create-profesor.input';
import { UpdateProfesorInput } from './dto/update-profesor.input';
import { ServiceHttp } from 'src/servicios/http.service';

@Injectable()
export class ProfesorService {
  constructor(private readonly serviceHttp: ServiceHttp) {}

  create(createProfesorInput: CreateProfesorInput) {
    return 'This action adds a new profesor';
  }

  findAll() {
    return this.serviceHttp.findAllProfesores();
  }

  findOne(id: string) {
    return this.serviceHttp.findProfesor(id);
  }

  update(id: string, updateProfesorInput: UpdateProfesorInput) {
    return `This action updates a #${id} profesor`;
  }

  remove(id: string) {
    return `This action removes a #${id} profesor`;
  }
}
