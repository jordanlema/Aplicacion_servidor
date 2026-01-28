const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost:5672';
const QUEUE_NAME = 'exam2p.record.deleted';

async function publish() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE_NAME, { durable: true });

    const message = {
        exam2p_entity: "Producto",
        exam2p_recordId: 456,
        exam2p_action: "DELETE",
        exam2p_user: "admin@test.com",
        exam2p_detail: "Producto descontinuado",
        exam2p_timestamp: new Date().toISOString()
    };

    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log("Mensaje enviado a RabbitMQ:", message);

    setTimeout(() => {
        ch.close();
        conn.close();
    }, 500);
}

publish().catch(console.error);