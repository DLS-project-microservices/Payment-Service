import connectToRabbitMQ from './messages/connection.js';
import { consumeItemsReservedEvents } from './messages/consumeItemsReservedEvents.js';
import express from 'express';


const app = express();




connectToRabbitMQ()
    .then(() => {
        console.log('Connected to RabbitMQ');
        consumeItemsReservedEvents();
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ:', error);
    });