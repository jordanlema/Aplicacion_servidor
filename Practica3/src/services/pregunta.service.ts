import { AppDataSource } from "../data-source";
import { Pregunta } from "../domain/pregunta.entity";

export class PreguntaService {
	private repo = AppDataSource.getRepository(Pregunta);

	async create(data: Partial<Pregunta>) {
		const nueva = this.repo.create(data);
		return await this.repo.save(nueva);
	}

	async findAll() {
		return await this.repo.find();
	}

	async findOne(id: number) {
		return await this.repo.findOneBy({ id });
	}

	async update(id: number, data: Partial<Pregunta>) {
		await this.repo.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number) {
		return await this.repo.delete(id);
	}
}
