import { Stripe } from 'stripe';
import Payment from '../models/payment.js';
import publishPaymentCaptured from '../messages/publishPaymentCaptured.js';
import publishPaymentCapturedFailed from '../messages/publishPaymentCapturedFailed.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  })

async function handlePaymentIntentWebhookEvent(payload) {
    const payment = await Payment.findOne({ payment_intent_id: payload.payment_intent });

    if (payment) {
        if (payload.status === 'succeeded') {
            payment.payment_status = 'succeeded';
            payment.total_payment = payload.amount_captured;
            await payment.save(); 
            await publishPaymentCaptured(payment.order);
        } else if (payload.status === 'failed') {
            payment.payment_status = 'failed';
            await payment.save();
            await publishPaymentCapturedFailed(payment.order);
        } else {
            console.log('Something went wrong.');
        }
    }
    // if payment is not found, create the payment. Waiting for the RabbitMQ event.
    else if (!payment) {
        const newPayment = new Payment({
            payment_intent_id: payload.payment_intent,
            total_payment: payload.amount,
            payment_status: payload.status
        });

        try {
            await newPayment.save();
        } catch (error) {
            console.log(error);
        }
    }
}

async function handlePaymentIntentMessage(message) {
    const payment = await Payment.findOne({ payment_intent_id: message.paymentIntent });
    console.log(payment);

    if (payment) {
        payment.order = message;
        await payment.save()
        if (payment.payment_status === 'succeeded') {
            await publishPaymentCaptured(payment.order);
        } else if (payment.payment_status === 'failed') {
            await publishPaymentCapturedFailed(payment.order);
        } else if (payment.payment_status === 'waiting') {
            console.log('This event has already been processed and will be ignored.')
        } 
        else {
            console.log('Something went wrong.');
        }
    }
    // if payment is not found, create the payment. Waiting for the webhook event.
    else if (!payment) {
        const newPayment = new Payment({
            payment_intent_id: message.paymentIntent,
            payment_status: 'waiting',
            order_id: message._id,
            order: message
        });

        try {
            await newPayment.save();
        } catch (error) {
            console.log(error);
        }
    }
}

async function handlePaymentRefund(orderId) {
    const payment = await Payment.findOne({ order_id: orderId });
    if (payment.payment_status === 'succeeded' && payment.total_payment > 0) {
        const refund = await stripe.refunds.create({
            payment_intent: payment.payment_intent_id,
          });

        if (refund.status === 'succeeded') {
            payment.payment_status = 'refunded';
            console.log(`The payment for the order with ID: '${orderId}' has been refunded.`)
            await payment.save();
        }
    }
}

export {
    handlePaymentIntentWebhookEvent,
    handlePaymentIntentMessage,
    handlePaymentRefund
}