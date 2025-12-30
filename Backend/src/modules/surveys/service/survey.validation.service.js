// src/modules/surveys/service/survey.validation.service.js
// Validation service for survey configuration and constraints

class SurveyValidationService {
  /**
   * Validate survey configuration for conflicts and business rule violations
   */
  validateSurveyConfig(surveyData) {
    const errors = [];

    // Rule 1: If visibility is workspace_members, workspace_id MUST be set
    if (surveyData.visibility === 'workspace_members' && !surveyData.workspace_id) {
      errors.push({
        field: 'workspace_id',
        message: 'workspace_id is required when visibility is workspace_members',
        code: 'MISSING_WORKSPACE_ID'
      });
    }

    // Rule 2: If visibility is workspace_members, identity_mode must not conflict
    if (surveyData.visibility === 'workspace_members' && 
        surveyData.identity_mode === 'anonymous_only') {
      // This is actually OK - workspace members can respond anonymously
    }

    // Rule 3: Public survey with identified_only identity
    // This is a warning, not an error - public survey but requires identity
    if (surveyData.visibility === 'public' && 
        surveyData.identity_mode === 'identified_only') {
      errors.push({
        field: 'identity_mode',
        message: 'public survey cannot require identified responses',
        code: 'CONFLICT_PUBLIC_IDENTIFIED',
        severity: 'error'
      });
    }

    // Rule 4: authenticated visibility should not have workspace_id
    // (unless future feature allows workspace-authenticated hybrid)
    if (surveyData.visibility === 'authenticated' && surveyData.workspace_id) {
      // Allow for now - might be for hybrid scenario
    }

    // Rule 5: Validate identity_mode values
    const validIdentityModes = ['anonymous_only', 'identified_only', 'mixed'];
    if (surveyData.identity_mode && !validIdentityModes.includes(surveyData.identity_mode)) {
      errors.push({
        field: 'identity_mode',
        message: `Invalid identity_mode. Must be one of: ${validIdentityModes.join(', ')}`,
        code: 'INVALID_IDENTITY_MODE'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate collector configuration
   */
  validateCollectorConfig(collectorData, survey) {
    const errors = [];

    // Rule 1: If collector access_level is workspace, workspace_id MUST be set
    if (collectorData.access_level === 'workspace' && !survey.workspace_id) {
      errors.push({
        field: 'access_level',
        message: 'Survey must belong to a workspace for workspace collector',
        code: 'INVALID_WORKSPACE_COLLECTOR'
      });
    }

    // Rule 2: If permission_mode is email_invitation, collector_type should support email
    if (collectorData.permission_mode === 'email_invitation' && 
        !['email', 'web_link'].includes(collectorData.collector_type)) {
      errors.push({
        field: 'permission_mode',
        message: 'email_invitation permission mode only works with email or web_link collector types',
        code: 'INVALID_PERMISSION_MODE'
      });
    }

    // Rule 3: Private survey cannot have public collectors
    if (survey.visibility === 'workspace_members' && 
        collectorData.access_level === 'public') {
      errors.push({
        field: 'access_level',
        message: 'workspace_members survey cannot have public collector',
        code: 'CONFLICT_PRIVATE_PUBLIC_COLLECTOR'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Determine if user can respond to survey based on visibility, auth, and collector
   */
  canUserRespondToSurvey(survey, userId = null, userWorkspaceIds = []) {
    // Check survey status
    if (survey.status !== 'active') {
      return {
        canRespond: false,
        reason: 'Survey is not active',
        code: 'SURVEY_INACTIVE'
      };
    }

    // Check visibility
    switch (survey.visibility) {
      case 'public':
        // Anyone can respond
        return { canRespond: true };

      case 'authenticated':
        // Must be logged in
        if (!userId) {
          return {
            canRespond: false,
            reason: 'Must be logged in to respond to this survey',
            code: 'AUTH_REQUIRED'
          };
        }
        return { canRespond: true };

      case 'workspace_members':
        // Must be logged in AND member of workspace
        if (!userId) {
          return {
            canRespond: false,
            reason: 'Must be logged in',
            code: 'AUTH_REQUIRED'
          };
        }
        if (!survey.workspace_id) {
          return {
            canRespond: false,
            reason: 'Survey workspace configuration invalid',
            code: 'INVALID_SURVEY_CONFIG'
          };
        }
        if (!userWorkspaceIds.includes(survey.workspace_id)) {
          return {
            canRespond: false,
            reason: 'Not a member of this workspace',
            code: 'NOT_WORKSPACE_MEMBER'
          };
        }
        return { canRespond: true };

      default:
        return {
          canRespond: false,
          reason: 'Unknown survey visibility',
          code: 'INVALID_VISIBILITY'
        };
    }
  }

  /**
   * Validate response submission against survey identity requirements
   */
  validateResponseIdentity(survey, isAuthenticated, submittedIdentity = null) {
    const errors = [];

    switch (survey.identity_mode) {
      case 'identified_only':
        // Must be authenticated AND provide identity
        if (!isAuthenticated) {
          errors.push({
            field: 'identity',
            message: 'This survey requires identified responses',
            code: 'IDENTITY_REQUIRED'
          });
        }
        break;

      case 'anonymous_only':
        // Force anonymous, user should not provide identity
        // But if they do, we can allow it (just ignore the identity)
        break;

      case 'mixed':
        // User can choose
        break;

      default:
        errors.push({
          field: 'identity_mode',
          message: 'Invalid identity mode configuration',
          code: 'INVALID_CONFIG'
        });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new SurveyValidationService();
