import { Actividad } from "../domain/actividad.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class ActividadService {
  private repo: Repository<Actividad>;
  constructor() {
    this.repo = AppDataSource.getRepository(Actividad);
  }
  async create(data: Partial<Actividad>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["curso", "entregas"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["curso", "entregas"] }); }
  async update(id: number, data: Partial<Actividad>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}