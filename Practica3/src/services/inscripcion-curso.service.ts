import { InscripcionCurso } from "../domain/inscripcion-curso.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class InscripcionCursoService {
  private repo: Repository<InscripcionCurso>;
  constructor() {
    this.repo = AppDataSource.getRepository(InscripcionCurso);
  }
  async create(data: Partial<InscripcionCurso>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["curso"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["curso"] }); }
  async findByEstudiante(estudianteId: number) { return this.repo.find({ where: { estudianteId }, relations: ["curso"] }); }
  async findByCurso(cursoId: number) { return this.repo.find({ where: { cursoId } }); }
  async update(id: number, data: Partial<InscripcionCurso>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}
