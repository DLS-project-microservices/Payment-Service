import 'dotenv/config';
import connectToRabbitMQ from './messages/connection.js';
import { consumeItemsReservedEvents } from './messages/consumeItemsReservedEvents.js';
import express from 'express';
import mongoose from 'mongoose';
import { Stripe } from "stripe"
import { handlePaymentIntentWebhookEvent } from './services/paymentService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  })

// Not catching erros on purpose, so that the application crashes fast.
await mongoose.connect(process.env.MONGODB_URI);
await connectToRabbitMQ();
await consumeItemsReservedEvents();

const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const paymentIntent = event.data.object;
  await handlePaymentIntentWebhookEvent(paymentIntent);

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

const PORT = process.env.PORT ?? 8000;
app.listen(8000, () => console.log('Running on port 8000'));