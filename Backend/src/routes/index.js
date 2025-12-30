// src/routes/index.js
// Central router aggregating all module routes
const { Router } = require('express');
const router = Router();

// Import modular routes
const moduleRoutes = require('./modules.routes');

// Mount modular architecture routes
router.use('/modules', moduleRoutes);

module.exports = router;
