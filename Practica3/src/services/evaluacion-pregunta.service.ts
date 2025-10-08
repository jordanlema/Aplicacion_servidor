import { EvaluacionPregunta } from "../domain/evaluacion-pregunta.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class EvaluacionPreguntaService {
  private repo: Repository<EvaluacionPregunta>;
  constructor() {
    this.repo = AppDataSource.getRepository(EvaluacionPregunta);
  }
  async create(data: Partial<EvaluacionPregunta>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["evaluacion", "pregunta"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["evaluacion", "pregunta"] }); }
  async update(id: number, data: Partial<EvaluacionPregunta>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}