import { Evaluacion } from "../domain/evaluacion.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class EvaluacionService {
  private repo: Repository<Evaluacion>;
  constructor() {
    this.repo = AppDataSource.getRepository(Evaluacion);
  }
  async create(data: Partial<Evaluacion>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["curso", "preguntas", "resultados"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["curso", "preguntas", "resultados"] }); }
  async update(id: number, data: Partial<Evaluacion>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}