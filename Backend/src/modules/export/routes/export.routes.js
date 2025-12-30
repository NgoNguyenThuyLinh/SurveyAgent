// src/modules/export/routes/export.routes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controller/export.controller');
const { authenticate, authorize } = require('../../../middleware/auth.middleware');

/**
 * @route   GET /api/export/survey/:survey_id/metadata
 * @desc    Get export metadata (response count, available formats)
 * @access  Private (Creator/Admin only)
 */
router.get('/survey/:survey_id/metadata', authenticate, exportController.getExportMetadata);

/**
 * @route   GET /api/export/survey/:survey_id/csv
 * @desc    Export survey responses to CSV
 * @access  Private (Creator/Admin only)
 */
router.get('/survey/:survey_id/csv', authenticate, exportController.exportToCSV);

/**
 * @route   GET /api/export/survey/:survey_id/json
 * @desc    Export survey responses to JSON
 * @access  Private (Creator/Admin only)
 */
router.get('/survey/:survey_id/json', authenticate, exportController.exportToJSON);

module.exports = router;
