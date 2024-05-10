import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    payment_intent_id: { 
        type: String,
        required: true 
    },
    total_payment: {
        type: Number,
        default: 0,
    },
    payment_status: {
        type: String,
        enum: ['succeeded', 'failed'],
        required: true
    }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;