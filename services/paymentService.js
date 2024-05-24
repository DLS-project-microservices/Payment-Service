import { Stripe } from 'stripe';
import Payment from '../models/payment.js';
import publishPaymentCaptured from '../messages/publishPaymentCaptured.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  })

async function handlePaymentIntentWebhookEvent(paymentIntent) {
    // Fetch payment_intent from DB by paymentIntent.id
    const payment = await Payment.findOne({ payment_intent_id: paymentIntent.payment_intent });

    // If payment_intent is found, send RabbitMQ continue order-flow success/failed
    if (payment) {
        if (paymentIntent.status === 'succeeded') {
            // send RabbitMQ message with payment_intent ID and order ID
            payment.payment_status = 'succeeded';
            await payment.save(); 
            await publishPaymentCaptured({
                paymentIntent: payment.payment_intent,
                order_id: payment.order_id
            });
            console.log('send RabbitMQ continue order-flow success');
        } else if (paymentIntent.status === 'failed') {
            // TODO: Figure out what to do on fail
            console.log('send RabbitMQ continue order-flow failed');
        } else {
            console.log('Something went wrong.');
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
        } catch (error) {
            console.log(error);
        }
    }
}

async function handlePaymentIntentMessage(message) {
    console.log('ORDERID', message._id)
    // Fetch payment_intent from DB by paymentIntent.id
    const payment = await Payment.findOne({ payment_intent_id: message.paymentIntent });
    console.log(payment);

    // If payment_intent is found, send RabbitMQ continue order-flow success/failed
    if (payment) {
        if (payment.payment_status === 'succeeded') {
            await publishPaymentCaptured({
                order_id: message._id
            });
            console.log('send RabbitMQ continue order-flow success');
        } else if (payment.payment_status === 'failed') {
            // TODO: Figure out what to do on fail
            console.log('send RabbitMQ continue order-flow failed');
        } else if (payment.payment_status === 'waiting') {
            console.log('This event has already been processed and will be ignored.')
        } 
        else {
            console.log('Something went wrong.');
        }
    }
    // If payment_intent is not found, save payment_intent
    else if (!payment) {
        const newPayment = new Payment({
            payment_intent_id: message.paymentIntent,
            payment_status: 'waiting',
            order_id: message._id   
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

async function handlePaymentRefund(orderId) {
    const payment = await Payment.findOne({ order_id: orderId });
    console.log(payment);
    if (payment.payment_status === 'succeeded' && payment_total_payment > 0) {
        const refund = await stripe.refunds.create({
            payment_intent: payment_payment_intent_id,
          });

        console.log(refund);

        if (refund.status === 'succeeded') {
            payment.payment_status = 'refunded';
            await payment.save();
        }
    }
}

export {
    handlePaymentIntentWebhookEvent,
    handlePaymentIntentMessage,
    handlePaymentRefund
}