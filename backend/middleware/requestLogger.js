/**
 * Request Logger Middleware
 * 
 * This middleware logs detailed information about incoming requests
 * including timing, IP address, user agent, and response details.
 */

const config = require('../config/config');

/**
 * Custom request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Store original res.end to intercept the response
  const originalEnd = res.end;
  
  // Log request start
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`   IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`   User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
  
  // Log request body for POST/PUT/PATCH requests (be careful with sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  // Log query parameters if any
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`   Query: ${JSON.stringify(req.query)}`);
  }
  
  // Override res.end to log response details
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusEmoji = getStatusEmoji(statusCode);
    
    console.log(`📤 ${statusEmoji} ${req.method} ${req.path} - ${statusCode} (${duration}ms)`);
    
    // Log response body in development (be careful with sensitive data)
    if (config.NODE_ENV === 'development' && chunk) {
      try {
        const responseBody = JSON.parse(chunk.toString());
        console.log(`   Response: ${JSON.stringify(responseBody, null, 2)}`);
      } catch (e) {
        // If it's not JSON, just log the raw response (truncated)
        const responseStr = chunk.toString();
        console.log(`   Response: ${responseStr.length > 200 ? responseStr.substring(0, 200) + '...' : responseStr}`);
      }
    }
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Get emoji for HTTP status codes
 */
const getStatusEmoji = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return '✅';
  if (statusCode >= 300 && statusCode < 400) return '↩️';
  if (statusCode >= 400 && statusCode < 500) return '❌';
  if (statusCode >= 500) return '💥';
  return '❓';
};

/**
 * Simple request logger (alternative lightweight version)
 */
const simpleRequestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = getStatusEmoji(res.statusCode);
    console.log(`${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

module.exports = config.NODE_ENV === 'development' ? requestLogger : simpleRequestLogger;
