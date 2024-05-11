import dotenv from 'dotenv';
import { Stripe } from "stripe"
import Payment from '../models/payment.js';
import publishPaymentCaptured from '../messages/publishPaymentCaptured.js';

dotenv.config();

async function handlePaymentIntentWebhookEvent(paymentIntent) {
    console.log(paymentIntent);
    // Fetch payment_intent from DB by paymentIntent.id
    const payment = await Payment.findOne({ payment_intent_id: paymentIntent.payment_intent });
    console.log(payment);

    // If payment_intent is found, send RabbitMQ continue order-flow success/failed
    if (payment) {
        if (paymentIntent.status === 'succeeded') {
            // send RabbitMQ message with payment_intent ID and order ID
            await publishPaymentCaptured({
                paymentIntent: payment.payment_intent,
                order_id: payment.order_id
            });
            console.log('send RabbitMQ continue order-flow success');
        } else if (paymentIntent.status === 'failed') {
            // TODO: Figure out what to do on fail
            console.log('send RabbitMQ continue order-flow failed');
        } else {
            console.log('Something went wrong :( Unknown status');
        }
    }
    // If payment_intent is not found, save payment_intent
    else if (!payment) {
        const newPayment = new Payment({
            payment_intent_id: paymentIntent.payment_intent,
            total_payment: paymentIntent.amount,
            payment_status: paymentIntent.status
        });

        try {
            const savedPayment = await newPayment.save();
            console.log(savedPayment);
        } catch (error) {
            console.log(error);
        }
    }
}

async function handlePaymentIntentMessage(message) {
    // Fetch payment_intent from DB by paymentIntent.id
    const payment = await Payment.findOne({ payment_intent_id: message.payment_intent });
    console.log(payment);

    // If payment_intent is found, send RabbitMQ continue order-flow success/failed
    if (payment) {
        if (payment.payment_status === 'succeeded') {
            // send RabbitMQ message with payment_intent ID and order ID
            await publishPaymentCaptured({
                paymentIntent: payment.payment_intent,
                order_id: message.order_id
            });
            console.log('send RabbitMQ continue order-flow success');
        } else if (payment.payment_status === 'failed') {
            // TODO: Figure out what to do on fail
            console.log('send RabbitMQ continue order-flow failed');
        } else {
            console.log('Something went wrong :( Unknown status');
        }
    }
    // If payment_intent is not found, save payment_intent
    else if (!payment) {
        const newPayment = new Payment({
            payment_intent_id: message.payment_intent,
            payment_status: 'waiting',
            order_id: message.order_id   
        });

        try {
            const savedPayment = await newPayment.save();
            console.log('Payment saved');
            console.log(savedPayment);
        } catch (error) {
            console.log(error);
        }
    }
}

export {
    handlePaymentIntentWebhookEvent,
    handlePaymentIntentMessage
}