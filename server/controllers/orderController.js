const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        // Validate stock and calculate prices
        let itemsPrice = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock} mtr`);
            }
            item.price = product.price;
            item.name = product.name;
            item.imageUrl = product.imageUrl;
            itemsPrice += product.price * item.quantity;
        }

        const shippingPrice = itemsPrice > 2000 ? 0 : 100;
        const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
        const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        });

        // Reduce stock for each product
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
    try {
        const { amount, orderId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects paise
            currency: 'inr',
            metadata: {
                userId: req.user._id.toString(),
                orderId: orderId,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm Stripe payment and mark order as paid
// @route   POST /api/orders/confirm-payment
// @access  Private
const confirmPayment = async (req, res, next) => {
    try {
        const { paymentIntentId, orderId } = req.body;

        // Verify with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            res.status(400);
            throw new Error('Payment not completed');
        }

        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: paymentIntentId,
            status: paymentIntent.status,
            updateTime: new Date().toISOString(),
        };

        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalOrders: total,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        order.status = req.body.status || order.status;

        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.update_time,
            emailAddress: req.body.payer?.email_address,
        };

        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Get sales statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getSalesStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalSalesResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

        const pendingOrders = await Order.countDocuments({ status: 'Processing' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await Order.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    sales: { $sum: '$totalPrice' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: {
                totalOrders,
                totalSales,
                pendingOrders,
                deliveredOrders,
                monthlySales,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // Only the order owner can cancel
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to cancel this order');
        }

        // Can only cancel if still Processing
        if (order.status !== 'Processing') {
            res.status(400);
            throw new Error(`Cannot cancel order. Current status: ${order.status}. Only "Processing" orders can be cancelled.`);
        }

        order.status = 'Cancelled';

        // Restore stock for each item
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }

        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderToPaid,
    getSalesStats,
    createPaymentIntent,
    confirmPayment,
    cancelOrder,
};
