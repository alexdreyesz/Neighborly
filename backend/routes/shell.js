/**
 * Shell Routes
 * 
 * These routes handle shell command execution and management.
 * IMPORTANT: These routes should be secured in production as they
 * execute system commands which can be dangerous.
 */

const express = require('express');
const router = express.Router();
const { catchAsync } = require('../middleware/errorHandler');

// Import controllers
const shellController = require('../controllers/shellController');

/**
 * GET /api/shell/commands
 * Get list of available shell commands (whitelisted safe commands)
 */
router.get('/commands', catchAsync(shellController.getAvailableCommands));

/**
 * POST /api/shell/execute
 * Execute a shell command
 * 
 * Request Body:
 * {
 *   "command": "ls -la",
 *   "timeout": 5000,
 *   "workingDirectory": "/path/to/directory"
 * }
 * 
 * IMPORTANT: This endpoint should be secured with authentication
 * and command validation in production!
 */
router.post('/execute', catchAsync(shellController.executeCommand));

/**
 * GET /api/shell/history
 * Get command execution history
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of commands per page (default: 20)
 * - user: Filter by user ID (if authentication is implemented)
 */
router.get('/history', catchAsync(shellController.getCommandHistory));

/**
 * GET /api/shell/history/:id
 * Get details of a specific command execution
 * 
 * URL Parameters:
 * - id: Command execution ID
 */
router.get('/history/:id', catchAsync(shellController.getCommandDetails));

/**
 * DELETE /api/shell/history/:id
 * Delete a command from history
 * 
 * URL Parameters:
 * - id: Command execution ID
 */
router.delete('/history/:id', catchAsync(shellController.deleteCommandHistory));

/**
 * GET /api/shell/system-info
 * Get system information (safe system information only)
 */
router.get('/system-info', catchAsync(shellController.getSystemInfo));

/**
 * POST /api/shell/validate-command
 * Validate if a command is safe to execute
 * 
 * Request Body:
 * {
 *   "command": "ls -la"
 * }
 */
router.post('/validate-command', catchAsync(shellController.validateCommand));

module.exports = router;
