/**
 * Health Check Routes
 * 
 * These routes provide health monitoring capabilities for the application.
 * Useful for load balancers, monitoring systems, and DevOps tools.
 */

const express = require('express');
const router = express.Router();

/**
 * Basic Health Check
 * GET /api/health
 * 
 * Returns a simple OK status for basic health monitoring
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ShellHacks Backend API'
  });
});

/**
 * Detailed Health Check
 * GET /api/health/detailed
 * 
 * Returns comprehensive health information including:
 * - System metrics
 * - Memory usage
 * - Uptime
 * - Environment information
 */
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ShellHacks Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch
    },
    system: {
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : 'N/A',
      freeMemory: `${Math.round(require('os').freemem() / 1024 / 1024)} MB`,
      totalMemory: `${Math.round(require('os').totalmem() / 1024 / 1024)} MB`
    }
  });
});

/**
 * Readiness Check
 * GET /api/health/ready
 * 
 * Checks if the application is ready to serve traffic.
 * This is different from liveness - it checks if all dependencies are available.
 */
router.get('/ready', (req, res) => {
  // Here you would typically check:
  // - Database connectivity
  // - External service availability
  // - Cache system status
  // - Any other critical dependencies
  
  const checks = {
    database: true, // Replace with actual database check
    cache: true,    // Replace with actual cache check
    external_apis: true // Replace with actual external API checks
  };
  
  const allHealthy = Object.values(checks).every(check => check === true);
  
  if (allHealthy) {
    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      checks: checks
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks: checks
    });
  }
});

/**
 * Liveness Check
 * GET /api/health/live
 * 
 * Checks if the application is alive and running.
 * This should be lightweight and always return 200 if the process is running.
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Helper function to format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result.trim();
}

module.exports = router;
