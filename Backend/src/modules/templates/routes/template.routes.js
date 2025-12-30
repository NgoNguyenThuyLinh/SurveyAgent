// src/modules/templates/routes/template.routes.js
const express = require('express');
const router = express.Router();
const templateController = require('../controller/template.controller');
const { authenticate, isTeacherOrAdmin } = require('../../../middleware/auth.middleware');

/**
 * @route   GET /api/templates/question-types
 * @desc    Get all question types
 * @access  Private
 */
router.get('/question-types', authenticate, templateController.getQuestionTypes);

/**
 * @route   GET /api/templates
 * @desc    Get all templates
 * @access  Private
 */
router.get('/', authenticate, templateController.getAllTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get template by ID with questions
 * @access  Private
 */
router.get('/:id', authenticate, templateController.getTemplateById);

/**
 * @route   POST /api/templates
 * @desc    Create new template
 * @access  Private (Creator/Admin only)
 */
router.post('/', authenticate, isTeacherOrAdmin, templateController.createTemplate);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Private (Owner/Admin only)
 */
router.put('/:id', authenticate, isTeacherOrAdmin, templateController.updateTemplate);

/**
 * @route   DELETE /api/templates/bulk
 * @desc    Bulk delete templates
 * @access  Private (Owner/Admin only)
 */
router.delete('/bulk', authenticate, isTeacherOrAdmin, templateController.deleteTemplates);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Private (Owner/Admin only)
 */
router.delete('/:id', authenticate, isTeacherOrAdmin, templateController.deleteTemplate);

/**
 * @route   POST /api/templates/:id/questions
 * @desc    Add question to template
 * @access  Private (Owner/Admin only)
 */
router.post('/:id/questions', authenticate, isTeacherOrAdmin, templateController.addQuestion);

module.exports = router;
