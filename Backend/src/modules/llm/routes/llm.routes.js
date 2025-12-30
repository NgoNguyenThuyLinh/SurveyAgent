// modules/llm/routes/llm.routes.js
const express = require('express');
const router = express.Router();
const llmController = require('../controller/llm.controller');
const { authenticate } = require('../../auth-rbac/middleware/auth.middleware');

// Public routes (no authentication needed)
const publicRoutes = require('./public.routes');
router.use('/public', publicRoutes);

// Apply authentication to protected LLM routes
router.use(authenticate);

/**
 * @route   GET /api/modules/llm/categories
 * @desc    Get available AI model categories
 * @access  Private
 */
router.get('/categories', llmController.getCategories);

/**
 * @route   GET /api/modules/llm/prompts
 * @desc    Get LLM prompts
 * @access  Private
 */
router.get('/prompts', llmController.getPrompts);

/**
 * @route   POST /api/modules/llm/prompts
 * @desc    Create new LLM prompt
 * @access  Private
 */
router.post('/prompts', llmController.createPrompt);

/**
 * @route   GET /api/modules/llm/prompts/:id
 * @desc    Get specific LLM prompt
 * @access  Private
 */
router.get('/prompts/:id', llmController.getPrompt);

/**
 * @route   PUT /api/modules/llm/prompts/:id
 * @desc    Update LLM prompt
 * @access  Private
 */
router.put('/prompts/:id', llmController.updatePrompt);

/**
 * @route   DELETE /api/modules/llm/prompts/:id
 * @desc    Delete LLM prompt
 * @access  Private
 */
router.delete('/prompts/:id', llmController.deletePrompt);

/**
 * @route   POST /api/modules/llm/generate
 * @desc    Generate questions using AI
 * @access  Private
 */
router.post('/generate', llmController.generateQuestions);

/**
 * @route   POST /api/modules/llm/generate-questions
 * @desc    Generate questions using AI (alternative endpoint)
 * @access  Private
 */
router.post('/generate-questions', llmController.generateQuestions);

/**
 * @route   POST /api/modules/llm/predict-category
 * @desc    Predict category for given text
 * @access  Private
 */
router.post('/predict-category', llmController.predictCategory);

/**
 * @route   POST /api/modules/llm/generate-survey
 * @desc    Generate complete survey using AI
 * @access  Private
 */
router.post('/generate-survey', llmController.generateSurvey);

/**
 * @route   POST /api/modules/llm/prompts/:promptId/test
 * @desc    Test a specific prompt
 * @access  Private
 */
router.post('/prompts/:promptId/test', llmController.testPrompt);

/**
 * @route   POST /api/modules/llm/create-survey
 * @desc    Create survey from generated questions
 * @access  Private
 */
router.post('/create-survey', llmController.createSurveyFromQuestions);

/**
 * @route   GET /api/modules/llm/export-pdf/:surveyId
 * @desc    Export survey as PDF
 * @access  Private
 */
router.get('/export-pdf/:surveyId', llmController.exportSurveyPDF);

/**
 * @route   POST /api/modules/llm/generate-link/:surveyId
 * @desc    Generate public link for survey
 * @access  Private
 */
router.post('/generate-link/:surveyId', llmController.generatePublicLink);

/**
 * @route   GET /api/modules/llm/surveys/:surveyId/results
 * @desc    Get survey results and analytics
 * @access  Private
 */
router.get('/surveys/:surveyId/results', llmController.getSurveyResults);

/**
 * @route   GET /api/modules/llm/surveys/:surveyId/edit
 * @desc    Get survey for editing
 * @access  Private
 */
router.get('/surveys/:surveyId/edit', llmController.getSurveyForEditing);

/**
 * @route   PUT /api/modules/llm/surveys/:surveyId/settings
 * @desc    Update survey settings (title, description, etc.)
 * @access  Private
 */
router.put('/surveys/:surveyId/settings', llmController.updateSurveySettings);

/**
 * @route   PUT /api/modules/llm/surveys/:surveyId/questions/:questionId
 * @desc    Update survey question
 * @access  Private
 */
router.put('/surveys/:surveyId/questions/:questionId', llmController.updateSurveyQuestion);

/**
 * @route   DELETE /api/modules/llm/surveys/:surveyId/questions/:questionId
 * @desc    Delete survey question
 * @access  Private
 */
router.delete('/surveys/:surveyId/questions/:questionId', llmController.deleteSurveyQuestion);

/**
 * @route   POST /api/modules/llm/surveys/:surveyId/questions
 * @desc    Add new question to survey
 * @access  Private
 */
router.post('/surveys/:surveyId/questions', llmController.addSurveyQuestion);

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        module: 'llm',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;