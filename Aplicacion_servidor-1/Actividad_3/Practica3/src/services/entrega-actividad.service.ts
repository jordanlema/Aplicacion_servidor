import { EntregaActividad } from "../domain/entrega-actividad.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class EntregaActividadService {
  private repo: Repository<EntregaActividad>;
  constructor() {
    this.repo = AppDataSource.getRepository(EntregaActividad);
  }
  async create(data: Partial<EntregaActividad>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["actividad"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["actividad"] }); }
  async findByEstudiante(estudianteId: number) { return this.repo.find({ where: { estudianteId }, relations: ["actividad"] }); }
  async findByActividad(actividadId: number) { return this.repo.find({ where: { actividadId } }); }
  async update(id: number, data: Partial<EntregaActividad>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}
