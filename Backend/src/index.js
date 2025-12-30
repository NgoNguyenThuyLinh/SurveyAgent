// src/index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Import routes

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:3000', // React dev server (Frontend)
    'http://127.0.0.1:3000', // Alternative localhost format
    'http://localhost:3001', // Fallback for other dev environments
    'http://127.0.0.1:3001',
    'http://localhost:3002', // Additional port
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
})); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// API Routes
const moduleRoutes = require('./routes/modules.routes'); // Modular architecture routes

// Modular architecture routes (primary endpoints)
app.use('/api/modules', moduleRoutes);

// Only modular architecture routes are used

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the LLM Survey API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

module.exports = app; // For testing purposes
