const express = require('express');
const { body, param } = require('express-validator');
const productCtrl = require('../controllers/productController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

// ===== PUBLIC ROUTES (Trang chủ + Trang sản phẩm) =====
// GET /api/products/allProducts - Lấy tất cả sản phẩm active
router.get('/allProducts', productCtrl.allProducts);

// GET /api/products/detailProduct/:productId - Lấy chi tiết sản phẩm
router.get('/detailProduct/:productId', [
  param('productId').isInt().withMessage('Invalid product ID'),
], productCtrl.detailProduct);

// GET /api/products/productByType/:type - Lấy sản phẩm theo category
router.get('/productByType/:type', productCtrl.productByType);

// POST /api/products/productByName - Tìm kiếm sản phẩm theo tên
router.post('/productByName', [
  body('name').trim().notEmpty().withMessage('Search name is required'),
], productCtrl.productByName);

// ===== ADMIN ROUTES =====
// GET /api/products/getAllProducts - Lấy tất cả sản phẩm (bao gồm inactive)
router.get('/getAllProducts', authenticateToken, authorizeRole('admin'), productCtrl.getAllProducts);

// PUT /api/products/updateProduct/:productId - Cập nhật sản phẩm
router.put('/updateProduct/:productId', [
  authenticateToken, 
  authorizeRole('admin'),
  param('productId').isInt().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
], productCtrl.updateProduct);

// DELETE /api/products/deleteProduct/:productId - Xóa sản phẩm
router.delete('/deleteProduct/:productId', [
  authenticateToken, 
  authorizeRole('admin'),
  param('productId').isInt().withMessage('Invalid product ID'),
], productCtrl.deleteProduct);

// DELETE /api/products/deleteVariant/:variantId - Xóa variant sản phẩm
router.delete('/deleteVariant/:variantId', [
  authenticateToken, 
  authorizeRole('admin'),
  param('variantId').isInt().withMessage('Invalid variant ID'),
], productCtrl.deleteVariant);

// POST /api/products/createProduct - Tạo sản phẩm mới
router.post('/createProduct', [
  authenticateToken, 
  authorizeRole('admin'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
], productCtrl.createProduct);

module.exports = router;
