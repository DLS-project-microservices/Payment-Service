import 'dotenv/config';
import SmeeClient from 'smee-client';
import { consumeItemsReservedEvents } from './messages/consumeItemsReservedEvents.js';
import { consumeShipmentSentFailed } from './messages/consumeShipmentSentFailed.js';
import express from 'express';
import mongoose from 'mongoose';
import { handlePaymentIntentWebhookEvent } from './services/paymentService.js';

const smee = new SmeeClient({
  source: process.env.SMEE_SOURCE,
  target: process.env.SMEE_TARGET,
  logger: console
})

smee.start()

// Not catching errors on purpose, so that the application crashes fast.
await mongoose.connect(process.env.MONGODB_URI);
await consumeItemsReservedEvents();
await consumeShipmentSentFailed();

const app = express();

app.post('/webhook', express.json(), async (request, response) => {
  try {
    const event = request.body.data.object
    if (request.body.type === 'charge.succeeded') {
      await handlePaymentIntentWebhookEvent(event);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (err) {
    console.log(err);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
});

const PORT = process.env.PORT ?? 3004;
app.listen(PORT, () => console.log('Running on port', PORT));