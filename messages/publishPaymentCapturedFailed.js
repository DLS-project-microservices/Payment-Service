import channel from './connection.js';

async function publishPaymentCapturedFailed(order) {
    const exchange = 'order_direct';
    
    try {
        await channel.assertExchange(exchange, 'direct', {
            durable: true
        });

        channel.publish(exchange, 'payment captured failed', Buffer.from(JSON.stringify(order)));
        console.log('payment_captured_failed message published successfully');
    } catch (error) {
        console.error('Error publishing payment_captured_failed message:', error);
    }
}

export default publishPaymentCapturedFailed;
