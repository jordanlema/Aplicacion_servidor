/**
 * ============================================
 * CONSUMER.JS - Consumidor de RabbitMQ
 * ============================================
 * Consume eventos de la cola: exam2p.record.deleted
 * Guarda los registros de auditoría en SQLite
 * Emite webhook cuando la acción es DELETE
 */

const amqp = require('amqplib');
const Exam2PAuditLog = require('../models/Exam2PAuditLog');
const { emitDeletionWebhook } = require('../webhook/webhookEmitter');

// Configuración de RabbitMQ
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'exam2p.record.deleted';

let connection = null;
let channel = null;

/**
 * Conectar a RabbitMQ y comenzar a consumir mensajes
 * Cola: exam2p.record.deleted
 */
async function connectAndConsume() {
    try {
        console.log('🔌 Conectando a RabbitMQ...');
        console.log(`📍 URL: ${RABBITMQ_URL}`);
        console.log(`📬 Cola: ${QUEUE_NAME}`);

        // Establecer conexión
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Asegurar que la cola existe
        await channel.assertQueue(QUEUE_NAME, {
            durable: true // La cola sobrevive reinicios
        });

        console.log('✅ Conectado a RabbitMQ');
        console.log(`👂 Escuchando mensajes en cola: ${QUEUE_NAME}`);

        // Consumir mensajes
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    console.log('\n📨 Mensaje recibido de RabbitMQ:');
                    console.log(content);

                    // Parsear el mensaje
                    const eventData = JSON.parse(content);

                    // Validar datos requeridos
                    if (!eventData.exam2p_entity || !eventData.exam2p_action) {
                        console.error('❌ Mensaje inválido: faltan campos requeridos');
                        channel.nack(msg, false, false); // Rechazar mensaje
                        return;
                    }

                    // Crear registro de auditoría en SQLite
                    const auditRecord = Exam2PAuditLog.create({
                        exam2p_entity: eventData.exam2p_entity,
                        exam2p_recordId: eventData.exam2p_recordId || 0,
                        exam2p_action: eventData.exam2p_action,
                        exam2p_user: eventData.exam2p_user || 'system',
                        exam2p_timestamp: eventData.exam2p_timestamp || new Date().toISOString(),
                        exam2p_detail: eventData.exam2p_detail || ''
                    });

                    console.log('💾 Registro guardado en SQLite:', auditRecord);

                    // Si la acción es DELETE, emitir webhook a n8n
                    if (eventData.exam2p_action === 'DELETE') {
                        console.log('🚨 Acción DELETE detectada - Emitiendo webhook...');
                        await emitDeletionWebhook(auditRecord);
                    }

                    // Confirmar procesamiento del mensaje
                    channel.ack(msg);
                    console.log('✅ Mensaje procesado correctamente\n');

                } catch (parseError) {
                    console.error('❌ Error al procesar mensaje:', parseError.message);
                    channel.nack(msg, false, false); // Rechazar mensaje malformado
                }
            }
        }, {
            noAck: false // Requiere confirmación manual
        });

        // Manejar cierre de conexión
        connection.on('close', () => {
            console.log('⚠️ Conexión a RabbitMQ cerrada');
            setTimeout(connectAndConsume, 5000); // Reconectar en 5 segundos
        });

        connection.on('error', (err) => {
            console.error('❌ Error de conexión RabbitMQ:', err.message);
        });

    } catch (error) {
        console.error('❌ Error al conectar con RabbitMQ:', error.message);
        console.log('🔄 Reintentando en 5 segundos...');
        setTimeout(connectAndConsume, 5000);
    }
}

/**
 * Cerrar conexión con RabbitMQ
 */
async function closeConnection() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log('🔌 Conexión a RabbitMQ cerrada correctamente');
    } catch (error) {
        console.error('❌ Error al cerrar conexión:', error.message);
    }
}

module.exports = {
    connectAndConsume,
    closeConnection
};
