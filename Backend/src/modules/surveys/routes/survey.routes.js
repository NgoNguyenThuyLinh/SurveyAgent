// src/modules/surveys/routes/survey.routes.js
const express = require('express');
const router = express.Router();
const surveyController = require('../controller/survey.controller');
const surveyAccessController = require('../controller/surveyAccess.controller');
const { authenticate, isTeacherOrAdmin } = require('../../../middleware/auth.middleware');

/**
 * @route   GET /api/surveys
 * @desc    Get all surveys (with pagination and filters)
 * @access  Private
 */
router.get('/', authenticate, surveyController.getAllSurveys);

/**
 * @route   GET /api/surveys/my-accessible
 * @desc    Get surveys user has access to (not as creator)
 * @access  Private
 */
router.get('/my-accessible', authenticate, surveyAccessController.getMyAccessibleSurveys);

/**
 * @route   GET /api/surveys/:id
 * @desc    Get survey by ID
 * @access  Private
 */
router.get('/:id', authenticate, surveyController.getSurveyById);

/**
 * @route   GET /api/surveys/:id/stats
 * @desc    Get survey statistics
 * @access  Private
 */
router.get('/:id/stats', authenticate, surveyController.getSurveyStats);

/**
 * @route   POST /api/surveys
 * @desc    Create new survey
 * @access  Private (Creator/Admin only)
 */
router.post('/', authenticate, isTeacherOrAdmin, surveyController.createSurvey);

/**
 * @route   PUT /api/surveys/:id
 * @desc    Update survey
 * @access  Private (Owner/Admin only)
 */
router.put('/:id', authenticate, isTeacherOrAdmin, surveyController.updateSurvey);

/**
 * @route   DELETE /api/surveys/bulk
 * @desc    Bulk delete surveys
 * @access  Private (Owner/Admin only)
 */
router.delete('/bulk', authenticate, isTeacherOrAdmin, surveyController.deleteSurveys);

/**
 * @route   DELETE /api/surveys/:id
 * @desc    Delete survey
 * @access  Private (Owner/Admin only)
 */
router.delete('/:id', authenticate, isTeacherOrAdmin, surveyController.deleteSurvey);

/**
 * @route   POST /api/surveys/:id/publish
 * @desc    Publish survey (draft -> active)
 * @access  Private (Owner/Admin only)
 */
router.post('/:id/publish', authenticate, isTeacherOrAdmin, surveyController.publishSurvey);

/**
 * @route   POST /api/surveys/:id/close
 * @desc    Close survey (active -> closed)
 * @access  Private (Owner/Admin only)
 */
router.post('/:id/close', authenticate, isTeacherOrAdmin, surveyController.closeSurvey);

/**
 * @route   PATCH /api/surveys/:id/status
 * @desc    Update survey status
 * @access  Private (Owner/Admin only)
 */
router.patch('/:id/status', authenticate, isTeacherOrAdmin, surveyController.updateSurveyStatus);

// Survey Access Routes

/**
 * @route   POST /api/surveys/:id/access
 * @desc    Grant access to a survey
 * @access  Private (Owner/Admin only)
 */
router.post('/:id/access', authenticate, isTeacherOrAdmin, surveyAccessController.grantAccess);

/**
 * @route   GET /api/surveys/:id/access
 * @desc    Get access grants for a survey
 * @access  Private (Owner/Admin only)
 */
router.get('/:id/access', authenticate, isTeacherOrAdmin, surveyAccessController.getSurveyAccessGrants);

/**
 * @route   DELETE /api/surveys/:id/access/:userId
 * @desc    Revoke access to a survey
 * @access  Private (Owner/Admin only)
 */
router.delete('/:id/access/:userId', authenticate, isTeacherOrAdmin, surveyAccessController.revokeAccess);

/**
 * @route   GET /api/surveys/:id/my-access
 * @desc    Get user's access level for a specific survey
 * @access  Private
 */
router.get('/:id/my-access', authenticate, surveyAccessController.getMyAccess);

// Survey Invite Routes
const surveyInviteController = require('../controller/surveyInvite.controller');

/**
 * @route   POST /api/modules/surveys/:id/invites
 * @desc    Create invites for a survey
 * @access  Private (Owner only)
 */
router.post('/:id/invites', authenticate, surveyInviteController.createInvites);

/**
 * @route   GET /api/modules/surveys/:id/invites
 * @desc    Get all invites for a survey
 * @access  Private (Owner only)
 */
router.get('/:id/invites', authenticate, surveyInviteController.getInvites);

/**
 * @route   GET /api/modules/surveys/:id/invites/stats
 * @desc    Get invite statistics
 * @access  Private (Owner only)
 */
router.get('/:id/invites/stats', authenticate, surveyInviteController.getInviteStats);

/**
 * @route   GET /api/modules/invites/:token/validate
 * @desc    Validate invite token (public)
 * @access  Public
 */
router.get('/invites/:token/validate', surveyInviteController.validateInvite);

/**
 * @route   DELETE /api/modules/invites/:id
 * @desc    Revoke invite
 * @access  Private (Owner only)
 */
router.delete('/invites/:id', authenticate, surveyInviteController.revokeInvite);

module.exports = router;
