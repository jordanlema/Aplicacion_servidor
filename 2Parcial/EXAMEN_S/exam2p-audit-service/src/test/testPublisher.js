/**
 * ============================================
 * TESTPUBLISHER.JS - Publicador de prueba
 * ============================================
 * Script para publicar mensajes de prueba en RabbitMQ
 * Cola: exam2p.record.deleted
 * 
 * Uso: npm run test:rabbit
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'exam2p.record.deleted';

/**
 * Publicar un mensaje de prueba DELETE
 */
async function publishDeleteEvent() {
    try {
        console.log('🔌 Conectando a RabbitMQ para publicar mensaje de prueba...');
        
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Mensaje de prueba DELETE
        const testMessage = {
            exam2p_entity: 'Usuario',
            exam2p_recordId: 12345,
            exam2p_action: 'DELETE',
            exam2p_user: 'admin@test.com',
            exam2p_timestamp: new Date().toISOString(),
            exam2p_detail: 'Usuario eliminado por el administrador - Prueba de examen'
        };

        console.log('\n📤 Publicando mensaje DELETE de prueba:');
        console.log(JSON.stringify(testMessage, null, 2));

        channel.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify(testMessage)),
            { persistent: true }
        );

        console.log('\n✅ Mensaje publicado exitosamente en cola:', QUEUE_NAME);

        // Esperar un momento y cerrar
        await new Promise(resolve => setTimeout(resolve, 500));
        await channel.close();
        await connection.close();

        console.log('🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error al publicar mensaje:', error.message);
        process.exit(1);
    }
}

/**
 * Publicar múltiples eventos de prueba
 */
async function publishMultipleEvents() {
    try {
        console.log('🔌 Conectando a RabbitMQ...');
        
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        const testEvents = [
            {
                exam2p_entity: 'Producto',
                exam2p_recordId: 100,
                exam2p_action: 'CREATE',
                exam2p_user: 'user1@test.com',
                exam2p_timestamp: new Date().toISOString(),
                exam2p_detail: 'Producto creado'
            },
            {
                exam2p_entity: 'Producto',
                exam2p_recordId: 100,
                exam2p_action: 'UPDATE',
                exam2p_user: 'user1@test.com',
                exam2p_timestamp: new Date().toISOString(),
                exam2p_detail: 'Producto actualizado - precio modificado'
            },
            {
                exam2p_entity: 'Producto',
                exam2p_recordId: 100,
                exam2p_action: 'DELETE',
                exam2p_user: 'admin@test.com',
                exam2p_timestamp: new Date().toISOString(),
                exam2p_detail: 'Producto eliminado del catálogo'
            }
        ];

        console.log('\n📤 Publicando múltiples eventos de prueba...\n');

        for (const event of testEvents) {
            channel.sendToQueue(
                QUEUE_NAME,
                Buffer.from(JSON.stringify(event)),
                { persistent: true }
            );
            console.log(`✅ ${event.exam2p_action} - ${event.exam2p_entity} #${event.exam2p_recordId}`);
        }

        console.log('\n✅ Todos los mensajes publicados');

        await new Promise(resolve => setTimeout(resolve, 500));
        await channel.close();
        await connection.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.includes('--multiple')) {
    publishMultipleEvents();
} else {
    publishDeleteEvent();
}
