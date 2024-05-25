import { connectToRabbitMQ } from 'amqplib-retry-wrapper-dls';

const channel = await connectToRabbitMQ(process.env.AMQP_HOST);

export default channel;