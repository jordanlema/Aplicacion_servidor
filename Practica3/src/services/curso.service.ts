import { Curso } from "../domain/curso.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class CursoService {
  private repo: Repository<Curso>;
  constructor() {
    this.repo = AppDataSource.getRepository(Curso);
  }
  async create(data: Partial<Curso>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["actividades", "evaluaciones", "inscripciones", "certificados"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["actividades", "evaluaciones", "inscripciones", "certificados"] }); }
  async update(id: number, data: Partial<Curso>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}