/**
 * User Routes
 * 
 * These routes handle user-related operations including:
 * - User CRUD operations
 * - User authentication
 * - User profile management
 */

const express = require('express');
const router = express.Router();
const { catchAsync } = require('../middleware/errorHandler');

// Import controllers
const userController = require('../controllers/userController');

/**
 * GET /api/users
 * Get all users (with pagination and filtering)
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of users per page (default: 10, max: 100)
 * - search: Search term for name or email
 * - sort: Sort field (default: 'createdAt')
 * - order: Sort order 'asc' or 'desc' (default: 'desc')
 */
router.get('/', catchAsync(userController.getAllUsers));

/**
 * GET /api/users/:id
 * Get a specific user by ID
 * 
 * URL Parameters:
 * - id: User ID
 */
router.get('/:id', catchAsync(userController.getUserById));

/**
 * POST /api/users
 * Create a new user
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 */
router.post('/', catchAsync(userController.createUser));

/**
 * PUT /api/users/:id
 * Update an existing user
 * 
 * URL Parameters:
 * - id: User ID
 * 
 * Request Body:
 * {
 *   "name": "Updated Name",
 *   "email": "updated@example.com"
 * }
 */
router.put('/:id', catchAsync(userController.updateUser));

/**
 * DELETE /api/users/:id
 * Delete a user
 * 
 * URL Parameters:
 * - id: User ID
 */
router.delete('/:id', catchAsync(userController.deleteUser));

/**
 * POST /api/users/login
 * User login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
router.post('/login', catchAsync(userController.login));

/**
 * POST /api/users/logout
 * User logout (if using sessions)
 */
router.post('/logout', catchAsync(userController.logout));

/**
 * GET /api/users/profile/me
 * Get current user's profile
 * Requires authentication middleware
 */
router.get('/profile/me', catchAsync(userController.getMyProfile));

/**
 * PUT /api/users/profile/me
 * Update current user's profile
 * Requires authentication middleware
 */
router.put('/profile/me', catchAsync(userController.updateMyProfile));

module.exports = router;
