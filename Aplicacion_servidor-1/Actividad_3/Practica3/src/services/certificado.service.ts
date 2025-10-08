import { Certificado } from "../domain/certificado.entity";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

export class CertificadoService {
  private repo: Repository<Certificado>;
  constructor() {
    this.repo = AppDataSource.getRepository(Certificado);
  }
  async create(data: Partial<Certificado>) { return this.repo.save(data); }
  async findAll() { return this.repo.find({ relations: ["curso"] }); }
  async findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ["curso"] }); }
  async findByEstudiante(estudianteId: number) { return this.repo.find({ where: { estudianteId }, relations: ["curso"] }); }
  async findByCodigo(codigoVerificacion: string) { return this.repo.findOne({ where: { codigoVerificacion }, relations: ["curso"] }); }
  async update(id: number, data: Partial<Certificado>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { return this.repo.delete(id); }
}
