import mongoose from 'mongoose';
import orderSchema from './order.js';

const paymentSchema = new mongoose.Schema({
    payment_intent_id: { 
        type: String,
        required: true 
    },
    total_payment: {
        type: Number,
        default: 0
    },
    payment_status: {
        type: String,
        enum: ['succeeded', 'failed', 'waiting', 'refunded'],
        required: true
    },
    order_id: {
        type: String
    },
    order: {
        type: orderSchema,
        required: false
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
