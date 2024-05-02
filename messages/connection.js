import 'dotenv/config';
import amqp from 'amqplib';

let connection = null;

async function connectToRabbitMQ() {
    if (connection) {
        return connection;
    }

    console.log(`Connecting to RabbitMQ...`);

    try {
        connection = await amqp.connect(`amqp://${process.env.AMQP_HOST}`);
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }

    console.log(`Connection to RabbitMQ established`);
    return connection;
}

export default connectToRabbitMQ;
