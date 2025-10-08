import { AppDataSource } from "../data-source";
import { Profesor } from "../domain/profesor.entity";
import { Usuario } from "../domain/usuario.entity";

export class ProfesorService {
  private repo = AppDataSource.getRepository(Profesor);
  private usuarioRepo = AppDataSource.getRepository(Usuario);

  async create(data: Partial<Profesor> & { usuarioId?: number }) {
    const usuarioId = data.usuarioId || (data.usuario as any)?.id;
    if (!usuarioId) {
      throw new Error("Debe especificar un usuarioId válido");
    }

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    if (usuario.rol !== "PROFESOR") {
      throw new Error("Solo los usuarios con rol PROFESOR pueden ser asignados como profesores");
    }

    const nuevoProfesor = this.repo.create({
      experiencia: data.experiencia,
      estado: data.estado,
      usuario: usuario,
    } as Partial<Profesor>);
    return await this.repo.save(nuevoProfesor);
  }

  
  async findAll() {
    return await this.repo.find({ relations: ["usuario"] });
  }

  
  async findOne(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ["usuario"],
    });
  }

  
  async update(id: number, data: Partial<Profesor>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  
  async remove(id: number) {
    return await this.repo.delete(id);
  }
}