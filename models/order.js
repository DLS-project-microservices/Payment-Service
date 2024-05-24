import mongoose from 'mongoose';
import orderLineItemSchema from './orderLineItem.js';
import customerSchema from './customer.js';

const orderSchema = new mongoose.Schema({
    orderCreatedDate: {
        type: Date,
        required: false
    },
    orderStatus: {
        type: String,
        required: false
    },
    orderNumber: {
        type: String,
        required: false
    },
    totalPrice: {
        type: Number,
        required: false
    },
    orderLineItems: [orderLineItemSchema],
    customer: customerSchema,
    paymentIntent: {
        type: String,
        required: false
    }
});

export default orderSchema;
