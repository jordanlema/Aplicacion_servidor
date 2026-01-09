import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CursoService } from './curso.service';
import { RedisService } from '../redis/redis.service';

@Controller()
export class CursoConsumer {
  constructor(
    private readonly cursoService: CursoService,
    private readonly redisService: RedisService,
  ) {}

  
  @EventPattern('course.validate')
  async handleCourseValidate(
    @Payload() payload: { message_id: string; curso_id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('\n📥 [course.validate] Mensaje recibido');
      console.log(`   Message ID: ${payload.message_id}`);
      console.log(`   Curso ID: ${payload.curso_id}`);

      //  IDEMPOTENCIA: Verificar si ya procesamos este mensaje
      const isProcessed = await this.redisService.isMessageProcessed(payload.message_id);
      
      if (isProcessed) {
        console.log('⚠️  Mensaje DUPLICADO detectado - Ignorando (idempotencia aplicada)');
        channel.ack(originalMsg);
        return;
      }

      // Procesar validación
      const result = await this.cursoService.validateCurso(payload.curso_id);
      
      // Marcar como procesado
      await this.redisService.markMessageAsProcessed(payload.message_id);

      if (result.valid && result.curso) {
        console.log(`✅ Curso válido: ${result.curso.nombre}`);
        console.log(`   Cupos disponibles: ${result.curso.cupos_disponibles}/${result.curso.cupos_totales}`);
      } else {
        console.log(`❌ Validación fallida: ${result.message}`);
      }

      channel.ack(originalMsg);
    } catch (error) {
      console.error('❌ Error en validación:', error.message);
      channel.ack(originalMsg);
    }
  }

  /**
   * Patrón: Idempotent Consumer
   * Reserva un cupo en el curso (operación crítica con idempotencia)
   */
  @EventPattern('course.reserveSpot')
  async handleReserveSpot(
    @Payload() payload: { message_id: string; curso_id: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('\n📥 [course.reserveSpot] Mensaje recibido');
      console.log(`   Message ID: ${payload.message_id}`);
      console.log(`   Curso ID: ${payload.curso_id}`);

      // 🔒 IDEMPOTENCIA: Intentar registrar el mensaje de forma atómica
      const isNew = await this.redisService.tryRegisterMessage(payload.message_id);

      if (!isNew) {
        console.log('⚠️  Mensaje DUPLICADO detectado - Reserva ya procesada (idempotencia aplicada)');
        console.log('   ✅ RESILIENCIA DEMOSTRADA: El sistema evitó reservar el cupo dos veces');
        channel.ack(originalMsg);
        return;
      }

      // Mensaje nuevo - procesar reserva
      console.log('🆕 Mensaje nuevo - Procesando reserva de cupo...');
      const result = await this.cursoService.reserveSpot(payload.curso_id);

      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ Reserva fallida: ${result.message}`);
      }

      channel.ack(originalMsg);
    } catch (error) {
      console.error('❌ Error reservando cupo:', error.message);
      channel.ack(originalMsg);
    }
  }

  /**
   * Crea un nuevo curso (para testing)
   */
  @EventPattern('course.create')
  async handleCourseCreate(
    @Payload() payload: { 
      message_id: string; 
      data: { nombre: string; descripcion: string; cupos_totales: number } 
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('\n📥 [course.create] Mensaje recibido');
      console.log(`   Curso: ${payload.data.nombre}`);

      // Idempotencia
      const isProcessed = await this.redisService.isMessageProcessed(payload.message_id);
      if (isProcessed) {
        console.log('⚠️  Curso ya creado (mensaje duplicado)');
        channel.ack(originalMsg);
        return;
      }

      const curso = await this.cursoService.create(payload.data);
      await this.redisService.markMessageAsProcessed(payload.message_id);
      
      console.log(`✅ Curso creado: ${curso.id}`);
      
      channel.ack(originalMsg);
    } catch (error) {
      console.error('❌ Error creando curso:', error.message);
      channel.ack(originalMsg);
    }
  }
}
