/**
 * Main API Routes
 * 
 * This file defines all the main API routes for the application.
 * It imports and uses route modules from different feature areas.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health');
const userRoutes = require('./users');
const shellRoutes = require('./shell');

/**
 * API Documentation Route of current endpoints
 * GET /api/docs
 */
router.get('/docs', (req, res) => {
  res.json({
    message: 'ShellHacks API Documentation',
    version: '1.0.0',
    endpoints: {
      health: {
        'GET /api/health': 'Health check endpoint',
        'GET /api/health/detailed': 'Detailed health information'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      shell: {
        'GET /api/shell/commands': 'Get available shell commands',
        'POST /api/shell/execute': 'Execute shell command',
        'GET /api/shell/history': 'Get command history'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>'
    },
    rateLimiting: {
      window: '15 minutes',
      maxRequests: '100 requests per IP'
    }
  });
});

// Mount route modules
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/shell', shellRoutes);

// Catch-all for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: 'Check /api/docs for available endpoints'
  });
});

module.exports = router;
