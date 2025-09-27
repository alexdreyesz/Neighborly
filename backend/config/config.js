/**
 * Configuration Module
 * 
 * This module centralizes all configuration settings for the application.
 * It reads from environment variables and provides sensible defaults.
 */

require('dotenv').config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS Configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // Database Configuration
  DATABASE: {
    URL: process.env.DATABASE_URL,
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 5432,
    NAME: process.env.DB_NAME || 'shellhacks',
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
  },
  
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // External API Configuration
  APIS: {
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY,
    },
    GITHUB: {
      TOKEN: process.env.GITHUB_TOKEN,
    },
  },
  
  // Logging Configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
  },
  
  // Rate Limiting Configuration
  RATE_LIMITING: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

// Validation function to check required configuration
const validateConfig = () => {
  const errors = [];
  
  // Check for required environment variables in production
  if (config.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-fallback-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL must be set in production');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Run validation
validateConfig();

module.exports = config;
