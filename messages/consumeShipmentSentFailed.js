import channel from './connection.js';
import publishPaymentCapturedFailed from './publishPaymentCapturedFailed.js';
import { handlePaymentRefund } from '../services/paymentService.js';



async function consumeShipmentSentFailed() {
    const exchange = 'order_direct';
    const queue = 'payment_service_consume_shipment_sent_failed';
    
    try {
        await channel.assertExchange(exchange, 'direct', {
            durable: true
        });

        const assertQueue = await channel.assertQueue(queue, {
            durable: true
        });

        channel.bindQueue(assertQueue.queue, exchange, 'shipment_sent_failed');

        console.log('Waiting for shipment_sent_failed events...');

        channel.consume(assertQueue.queue, async (msg) => {
            try {
                if (msg !== null) {
                    const messageContent = JSON.parse(msg.content.toString());
                    await handlePaymentRefund(messageContent.paymentIntent);
                    await publishPaymentCapturedFailed(messageContent)
                                
                    channel.ack(msg);
                    console.log('shipment_sent_failed processed succesfully.')
                }
            } catch (error) {
                console.error('Error processing shipment_sent_failed event:', error);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

export { consumeShipmentSentFailed };
