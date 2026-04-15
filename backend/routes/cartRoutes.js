const express = require('express');
const { body, param } = require('express-validator');
const CartController = require('../controllers/cartController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

// Giỏ hàng
router.post('/addItem', [
  authenticateToken,
  body('userId').isInt().withMessage('Invalid User ID'),
  body('productVariantId').isInt().withMessage('Invalid Variant ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], CartController.addItem);

router.get('/viewCart/:userId', [
  authenticateToken,
  param('userId').isInt().withMessage('Invalid User ID'),
], CartController.viewCart);

router.put('/updateItem/:cartItemId', [
  authenticateToken,
  param('cartItemId').isInt().withMessage('Invalid Cart Item ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], CartController.updateItem);

router.delete('/removeItem/:cartItemId', [
  authenticateToken,
  param('cartItemId').isInt().withMessage('Invalid Cart Item ID'),
], CartController.removeItem);

router.delete('/clearCart/:cartId', [
  authenticateToken,
  param('cartId').isInt().withMessage('Invalid Cart ID'),
], CartController.clearCart);

router.post('/restore-from-order', [
  authenticateToken,
  body('userId').isInt().withMessage('Invalid User ID'),
  body('orderId').isInt().withMessage('Invalid Order ID'),
], CartController.restoreCartFromUnpaidOrder);

module.exports = router;