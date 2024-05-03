import connectToRabbitMQ from './connection.js';
import publishPaymentCaptured from './publishPaymentCaptured.js';

async function consumeItemsReservedEvents() {
    try {
        const connection = await connectToRabbitMQ();
        const channel = await connection.createChannel();
        const exchange = 'order_direct';
        const queue = 'payment_service_consume_items_reserved';

        await channel.assertExchange(exchange, 'direct', {
            durable: true
        });

        const assertQueue = await channel.assertQueue(queue, {
            durable: true
        });

        channel.bindQueue(assertQueue.queue, exchange, 'items reserved');

        console.log('Waiting for items_reserved events...');

        channel.consume(assertQueue.queue, async (msg) => {
            try {
                if (msg !== null) {
                    const messageContent = JSON.parse(msg.content.toString());
                    console.log(messageContent);
                    
                    await publishPaymentCaptured(messageContent);
                    console.log('items_reserved event processed successfully');
                    channel.ack(msg);
                }
            } catch (error) {
                console.error('Error processing items_reserved event:', error);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

export { consumeItemsReservedEvents };
