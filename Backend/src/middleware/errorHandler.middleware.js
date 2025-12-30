const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER]', err);
  logger.error(err.stack);
  
  // Extract error details
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal Server Error';
  
  // Build standardized response
  const response = {
    success: false,
    code: code,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  // Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      stack: err.stack,
      details: err.details || null
    };
  }
  
  // Ensure we always send JSON
  res.status(status).json(response);
};

module.exports = errorHandler;
