import connectToRabbitMQ from './messages/connection.js';
import { consumeItemsReservedEvents } from './messages/consumeItemsReservedEvents.js';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Stripe } from "stripe"
import { handlePaymentIntentWebhookEvent } from './services/paymentService.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  })

const url = process.env.MONGODB_URI;
mongoose.connect(url);
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

const app = express();


// whsec_3242e4b0f114bb39b4bb502b7ae52a29c2d1a44f0d506e2b50522a98a82d6706
const endpointSecret = "whsec_zfIKmNoWVaMPd6IsuxpISjfGqjzmC3WE";

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  console.log('testtest');
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const paymentIntent = event.data.object;
      // Then define and call a function to handle the event charge.failed
      await handlePaymentIntentWebhookEvent(paymentIntent);

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.listen(8000, () => console.log('Running on port 8000'));

connectToRabbitMQ()
    .then(() => {
        console.log('Connected to RabbitMQ');
        consumeItemsReservedEvents();
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ:', error);
    });