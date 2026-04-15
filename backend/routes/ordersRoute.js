const express = require('express');
const { body, param } = require('express-validator');
const OrderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

// Thanh toán và đơn hàng (Customer)
router.get('/checkout/:cartId', [
  authenticateToken,
  param('cartId').isInt().withMessage('Invalid Cart ID'),
], OrderController.getCheckoutInfo);

router.post('/createOrder', [
  authenticateToken,
  body('cartId').isInt().withMessage('Invalid Cart ID'),
  body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
], OrderController.createOrder);

router.get('/orderDetail/:orderId', [
  authenticateToken,
  param('orderId').isInt().withMessage('Invalid Order ID'),
], OrderController.getOrderDetail);

router.get('/myOrders/:userId', [
  authenticateToken,
  param('userId').isInt().withMessage('Invalid User ID'),
], OrderController.getMyOrders);

router.put('/cancelOrder/:orderId', [
  authenticateToken,
  param('orderId').isInt().withMessage('Invalid Order ID'),
  body('reason').optional().trim().isString(),
], OrderController.cancelOrder);

router.put('/updatePaymentStatus/:orderId', [
  authenticateToken,
  param('orderId').isInt().withMessage('Invalid Order ID'),
  body('payment_status').trim().notEmpty().withMessage('Payment status is required'),
], OrderController.updatePaymentStatus);

// Admin
router.get('/getAllOrder', authenticateToken, authorizeRole('admin'), OrderController.getAllOrders);
router.put('/updateOrder/:orderId', [
  authenticateToken,
  authorizeRole('admin'),
  param('orderId').isInt().withMessage('Invalid Order ID'),
], OrderController.updateOrder);

router.post('/search', [
  authenticateToken,
  authorizeRole('admin'),
], OrderController.searchOrders);

module.exports = router;