const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.5 },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true, default: 'India' },
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Stripe', 'COD', 'Razorpay'],
            default: 'Stripe',
        },
        paymentResult: {
            id: String,
            status: String,
            updateTime: String,
            emailAddress: String,
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: Date,
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: Date,
        status: {
            type: String,
            enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
