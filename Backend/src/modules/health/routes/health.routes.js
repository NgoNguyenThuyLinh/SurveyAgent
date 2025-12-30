// modules/health/routes/health.routes.js
// Comprehensive health check endpoint
const express = require('express');
const router = express.Router();
const sequelize = require('../../../config/database');
const logger = require('../../../utils/logger');

/**
 * @route   GET /api/modules/health
 * @desc    Comprehensive health check - DB connection, version, uptime
 * @access  Public
 */
router.get('/', async (req, res) => {
  const healthCheck = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    db: false,
    dbDetails: null
  };

  try {
    // Test database connection
    await sequelize.authenticate();
    healthCheck.db = true;
    
    // Get database info
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    
    healthCheck.dbDetails = {
      connected: true,
      database: process.env.DB_NAME,
      tables: results[0].table_count
    };
    
    logger.info('Health check passed');
    res.status(200).json(healthCheck);
    
  } catch (error) {
    healthCheck.ok = false;
    healthCheck.db = false;
    healthCheck.dbDetails = {
      connected: false,
      error: error.message
    };
    
    logger.error('Health check failed:', error);
    res.status(503).json(healthCheck);
  }
});

module.exports = router;





