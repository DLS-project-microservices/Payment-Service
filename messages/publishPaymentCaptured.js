import connectToRabbitMQ from './connection.js';

async function publishPaymentCaptured(order) {
    try {
        const connection = await connectToRabbitMQ();
        const channel = await connection.createChannel();
        const exchange = 'order_direct';

        await channel.assertExchange(exchange, 'direct', {
            durable: true
        });

        channel.publish(exchange, 'payment captured', Buffer.from(JSON.stringify(order)));
        console.log('payment_captured message published successfully');
    } catch (error) {
        console.error('Error publishing payment_captured message:', error);
    }
}

export default publishPaymentCaptured;
