import mongoose from 'mongoose';

const orderLineItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    productId: {
        type: Number,
        required: false
    },
    totalPrice: {
        type: Number,
        required: false
    }
});

export default orderLineItemSchema;
