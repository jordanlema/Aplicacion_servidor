import { Repository } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class InscripcionService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly repo: Repository<Inscripcion>,
    @Inject('CURSO_SERVICE')
    private readonly cursoClient: ClientProxy,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Crea una inscripción con idempotencia completa
   * Este es el método principal que demuestra resiliencia
   */
  async createInscripcion(data: {
    curso_id: string;
    estudiante_nombre: string;
    estudiante_email: string;
    idempotency_key?: string;
  }): Promise<{ inscripcion: Inscripcion; isNew: boolean }> {
    
    // Generar message_id único para idempotencia
    const messageId = data.idempotency_key || randomUUID();

    console.log('\n🔵 Iniciando creación de inscripción...');
    console.log(`   Message ID: ${messageId}`);
    console.log(`   Curso: ${data.curso_id}`);
    console.log(`   Estudiante: ${data.estudiante_nombre}`);

    // 🔒 PASO 1: Verificar idempotencia en Redis
    const isAlreadyProcessed = await this.redisService.isMessageProcessed(messageId);
    
    if (isAlreadyProcessed) {
      console.log('⚠️  IDEMPOTENCIA: Esta inscripción ya fue procesada');
      
      // Buscar inscripción existente
      const existing = await this.repo.findOne({ where: { message_id: messageId } });
      if (existing) {
        console.log(`   ✅ Retornando inscripción existente: ${existing.id}`);
        return { inscripcion: existing, isNew: false };
      }
    }

    // 🔒 PASO 2: Intentar registrar mensaje de forma atómica
    const isNew = await this.redisService.tryRegisterMessage(messageId);
    
    if (!isNew) {
      console.log('⚠️  Mensaje duplicado detectado por Redis (race condition evitada)');
      const existing = await this.repo.findOne({ where: { message_id: messageId } });
      if (!existing) {
        throw new Error('Inscripción no encontrada después de detectar duplicado');
      }
      return { inscripcion: existing, isNew: false };
    }

    console.log('🆕 Mensaje nuevo - Procesando inscripción...');

    // PASO 3: Validar curso (enviar mensaje a ms-curso)
    console.log('📤 Enviando validación a ms-curso...');
    this.cursoClient.emit('course.validate', {
      message_id: `validate-${messageId}`,
      curso_id: data.curso_id,
    });

    // PASO 4: Crear inscripción en PENDING
    const inscripcion = this.repo.create({
      curso_id: data.curso_id,
      estudiante_nombre: data.estudiante_nombre,
      estudiante_email: data.estudiante_email,
      message_id: messageId,
      status: 'PENDING',
    });
    await this.repo.save(inscripcion);
    console.log(`✅ Inscripción creada en BD: ${inscripcion.id}`);

    // PASO 5: Reservar cupo en ms-curso
    console.log('📤 Enviando reserva de cupo a ms-curso...');
    this.cursoClient.emit('course.reserveSpot', {
      message_id: `reserve-${messageId}`,
      curso_id: data.curso_id,
    });

    // PASO 6: Actualizar estado a CONFIRMED
    inscripcion.status = 'CONFIRMED';
    await this.repo.save(inscripcion);
    console.log('✅ Inscripción CONFIRMADA');

    return { inscripcion, isNew: true };
  }

  async findAll(): Promise<Inscripcion[]> {
    return this.repo.find();
  }
}