const express = require('express');
const { body, param } = require('express-validator');
const blogController = require('../controllers/blogController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

// Admin routes - must come before /:id route to avoid conflicts
router.get('/admin/all', [
  authenticateToken, 
  authorizeRole('admin')
], blogController.getAllBlogsAdmin);

router.post('/create', [
  authenticateToken,
  authorizeRole('admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
], blogController.createBlog);

// Public routes for search
router.get('/search', blogController.searchBlogs);
router.get('/category', blogController.getBlogsByCategory);
router.get('/about/page', blogController.getAboutPage); // Trang About
router.get('/distributor/page', blogController.getDistributorPage); // Trang Tuyển đại lý

// Public routes
router.get('/all', blogController.getAllBlogs);

// Admin routes with ID parameter
router.put('/:id', [
  authenticateToken,
  authorizeRole('admin'),
  param('id').isInt().withMessage('Invalid blog ID'),
], blogController.updateBlog);

router.delete('/:id', [
  authenticateToken,
  authorizeRole('admin'),
  param('id').isInt().withMessage('Invalid blog ID'),
], blogController.deleteBlog);

// Comment routes - require authentication
router.post('/:id/comments', [
  authenticateToken,
  param('id').isInt().withMessage('Invalid blog ID'),
  body('content').trim().notEmpty().withMessage('Comment content is required'),
], blogController.addComment);

// Get blog detail (public)
router.get('/:id', [
  param('id').isInt().withMessage('Invalid blog ID'),
], blogController.getBlogDetail);

module.exports = router;
