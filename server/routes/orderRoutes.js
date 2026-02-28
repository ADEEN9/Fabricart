const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Admin-only routes (must be BEFORE /:id)
router.get('/stats', protect, admin, getSalesStats);
router.get('/', protect, admin, getAllOrders);

// Stripe payment routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

// Private routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
