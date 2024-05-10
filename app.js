import connectToRabbitMQ from './messages/connection.js';
import { consumeItemsReservedEvents } from './messages/consumeItemsReservedEvents.js';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI;
mongoose.connect(url);
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

const app = express();

function handlePaymentIntentSucceeded(paymentIntent) {
    console.log('PaymentIntent was successful!');
}

function handlePaymentIntentFailed(paymentIntent) {
    console.log('PaymentIntent failed!');
}

const endpointSecret = "whsec_3242e4b0f114bb39b4bb502b7ae52a29c2d1a44f0d506e2b50522a98a82d6706";

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'charge.failed':
      const chargeFailed = event.data.object;
      // Then define and call a function to handle the event charge.failed
      break;
    case 'charge.succeeded':
      const chargeSucceeded = event.data.object;
      // Then define and call a function to handle the event charge.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

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