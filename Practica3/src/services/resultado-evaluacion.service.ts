import { ResultadoEvaluacion } from "../domain/resultado-evaluacion.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class ResultadoEvaluacionService {
  private repo: Repository<ResultadoEvaluacion>;
  constructor() {
    this.repo = AppDataSource.getRepository(ResultadoEvaluacion);
  }
  async create(data: Partial<ResultadoEvaluacion>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["evaluacion"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["evaluacion"] }); }
  async findByEstudiante(estudianteId: number) { return this.repo.find({ where: { estudianteId }, relations: ["evaluacion"] }); }
  async findByEvaluacion(evaluacionId: number) { return this.repo.find({ where: { evaluacionId } }); }
  async update(id: number, data: Partial<ResultadoEvaluacion>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}
