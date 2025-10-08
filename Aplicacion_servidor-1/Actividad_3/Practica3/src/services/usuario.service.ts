import { AppDataSource } from "../data-source";
import { Usuario } from "../domain/usuario.entity";

export class UsuarioService {
	private repo = AppDataSource.getRepository(Usuario);

	async create(data: Partial<Usuario>) {
		const nuevo = this.repo.create(data);
		return await this.repo.save(nuevo);
	}

	async findAll() {
		return await this.repo.find();
	}

	async findOne(id: number) {
		return await this.repo.findOneBy({ id });
	}

	async update(id: number, data: Partial<Usuario>) {
		await this.repo.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number) {
		return await this.repo.delete(id);
	}
}
