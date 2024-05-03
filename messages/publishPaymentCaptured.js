import connectToRabbitMQ from './connection.js';

async function publishPaymentCaptured(order) {
    try {
        const connection = await connectToRabbitMQ();
        const channel = await connection.createChannel();
        const exchange = 'order_direct';
        // const queueName = 'payment_captured';

        await channel.assertExchange(exchange, 'direct', {
            durable: true
        });
/*
        // Not sure if this is needed
        await channel.assertQueue(queueName, {
            durable: true
        });
        // Not sure if this is needed
        await channel.bindQueue(queueName, exchange, 'payment_captured');
        */
        
        channel.publish(exchange, 'payment captured', Buffer.from(JSON.stringify(order)));
        console.log('payment_captured message published successfully');
    } catch (error) {
        console.error('Error publishing payment_captured message:', error);
    }
}

export default publishPaymentCaptured;
