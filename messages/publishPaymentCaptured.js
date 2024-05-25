import channel from './connection.js';

async function publishPaymentCaptured(order) {
    const exchange = 'order_direct';
    
    try {
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
