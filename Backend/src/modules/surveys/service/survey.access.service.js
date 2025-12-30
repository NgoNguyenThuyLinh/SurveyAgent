// src/modules/surveys/service/survey.access.service.js
// Handle survey access control and permissions

const { Survey, SurveyCollector, Workspace, WorkspaceMember } = require('../../../models');
const surveyValidationService = require('./survey.validation.service');
const logger = require('../../../utils/logger');

class SurveyAccessService {
  /**
   * Check if user can respond to survey via collector
   */
  async canRespondToSurvey(collectorToken, userId = null, inviteToken = null) {
    try {
      // Get collector
      const collector = await SurveyCollector.findOne({
        where: { token: collectorToken },
        include: [{ model: Survey, as: 'Survey' }]
      });

      if (!collector) {
        return {
          allowed: false,
          reason: 'Collector not found',
          code: 'COLLECTOR_NOT_FOUND'
        };
      }

      if (!collector.is_active) {
        return {
          allowed: false,
          reason: 'Collector is not active',
          code: 'COLLECTOR_INACTIVE'
        };
      }

      const survey = collector.survey;

      if (survey.status !== 'active') {
        return {
          allowed: false,
          reason: 'Survey is not active',
          code: 'SURVEY_INACTIVE'
        };
      }

      // Check collector expiration
      if (collector.expires_at && new Date() > collector.expires_at) {
        return {
          allowed: false,
          reason: 'Collector has expired',
          code: 'COLLECTOR_EXPIRED'
        };
      }

      // Use collector service to verify access
      try {
        await require('../../collectors/service/collector.service')
          .verifyCollectorAccess(collectorToken, userId, inviteToken);

        return { allowed: true };
      } catch (error) {
        return {
          allowed: false,
          reason: error.message,
          code: error.code || 'ACCESS_DENIED'
        };
      }
    } catch (error) {
      logger.error('[SurveyAccess] Error checking response access:', error.message);
      return {
        allowed: false,
        reason: 'System error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Check if user can manage survey (create, edit, delete)
   */
  async canManageSurvey(surveyId, userId, userRole) {
    try {
      const survey = await Survey.findByPk(surveyId);

      if (!survey) {
        return { allowed: false, reason: 'Survey not found' };
      }

      // Owner or admin can manage
      if (survey.created_by === userId || userRole === 'admin') {
        return { allowed: true };
      }

      // Workspace collaborators can manage if survey in workspace
      if (survey.workspace_id) {
        const member = await WorkspaceMember.findOne({
          where: {
            workspace_id: survey.workspace_id,
            user_id: userId,
            role: 'collaborator'
          }
        });

        if (member) {
          return { allowed: true };
        }
      }

      return {
        allowed: false,
        reason: 'Not authorized to manage this survey'
      };
    } catch (error) {
      logger.error('[SurveyAccess] Error checking manage access:', error.message);
      return { allowed: false, reason: 'System error' };
    }
  }

  /**
   * Check if user can view survey results
   */
  async canViewResults(surveyId, userId, userRole) {
    return this.canManageSurvey(surveyId, userId, userRole);
  }

  /**
   * Validate survey before creating
   */
  validateSurveyCreation(surveyData) {
    // Check for conflicts
    const validation = surveyValidationService.validateSurveyConfig(surveyData);

    if (!validation.valid) {
      const error = new Error('Survey configuration invalid');
      error.code = 'INVALID_SURVEY_CONFIG';
      error.details = validation.errors;
      throw error;
    }

    return true;
  }

  /**
   * Get user's workspace memberships with roles
   */
  async getUserWorkspaces(userId) {
    try {
      const memberships = await WorkspaceMember.findAll({
        where: { user_id: userId, is_active: true },
        include: [{ model: Workspace, as: 'workspace' }],
        attributes: ['workspace_id', 'role']
      });

      return memberships.map(m => ({
        workspaceId: m.workspace_id,
        workspaceName: m.workspace.name,
        role: m.role
      }));
    } catch (error) {
      logger.error('[SurveyAccess] Error getting user workspaces:', error.message);
      return [];
    }
  }
}

module.exports = new SurveyAccessService();
