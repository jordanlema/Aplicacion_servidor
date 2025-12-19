import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './curso.entity';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private repo: Repository<Curso>,
    private webhookService: WebhookService,
  ) {}

  async create(data: { nombre: string; descripcion: string; cupos_totales: number }): Promise<Curso> {
    // 🔒 IDEMPOTENCIA: Verificar si ya existe un curso con el mismo nombre
    const existingCurso = await this.repo.findOne({ where: { nombre: data.nombre } });
    
    if (existingCurso) {
      console.log(`⚠️  IDEMPOTENCIA: Curso "${data.nombre}" ya existe con ID: ${existingCurso.id}`);
      console.log(`   ✅ Retornando curso existente (idempotencia aplicada)`);
      return existingCurso;
    }

    const curso = this.repo.create(data);
    const savedCurso = await this.repo.save(curso);
    
    // 🌐 ACTIVIDAD 2: Publicar webhook cuando se crea un curso
    await this.webhookService.publishCourseCreated({
      id: savedCurso.id,
      nombre: savedCurso.nombre,
      descripcion: savedCurso.descripcion,
      cupos_totales: savedCurso.cupos_totales,
      cupos_ocupados: savedCurso.cupos_ocupados,
    });
    
    return savedCurso;
  }

  async findAll(): Promise<Curso[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Curso | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Valida si un curso existe y tiene cupos disponibles
   */
  async validateCurso(cursoId: string): Promise<{ valid: boolean; message: string; curso?: Curso }> {
    const curso = await this.findById(cursoId);
    
    if (!curso) {
      return { valid: false, message: 'Curso no encontrado' };
    }

    if (!curso.tiene_cupos) {
      return { valid: false, message: 'Curso sin cupos disponibles', curso };
    }

    return { valid: true, message: 'Curso disponible', curso };
  }

  /**
   * Reserva un cupo en el curso (incrementa cupos_ocupados)
   * Esta operación debe ser idempotente
   */
  async reserveSpot(cursoId: string): Promise<{ success: boolean; message: string }> {
    const curso = await this.findById(cursoId);
    
    if (!curso) {
      return { success: false, message: 'Curso no encontrado' };
    }

    if (!curso.tiene_cupos) {
      return { success: false, message: 'Sin cupos disponibles' };
    }

    // Reservar cupo
    curso.cupos_ocupados += 1;
    await this.repo.save(curso);

    console.log(`✅ Cupo reservado en curso "${curso.nombre}". Cupos: ${curso.cupos_ocupados}/${curso.cupos_totales}`);
    
    return { 
      success: true, 
      message: `Cupo reservado. Disponibles: ${curso.cupos_disponibles}/${curso.cupos_totales}` 
    };
  }

  /**
   * Libera un cupo (decrementa cupos_ocupados)
   */
  async releaseSpot(cursoId: string): Promise<void> {
    const curso = await this.findById(cursoId);
    if (curso && curso.cupos_ocupados > 0) {
      curso.cupos_ocupados -= 1;
      await this.repo.save(curso);
      console.log(`🔄 Cupo liberado en curso "${curso.nombre}"`);
    }
  }
}
