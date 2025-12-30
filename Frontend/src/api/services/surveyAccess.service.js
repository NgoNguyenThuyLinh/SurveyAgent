// src/api/services/surveyAccess.service.js - Survey Access API service
import http from '../http';

const SurveyAccessService = {
  /**
   * Grant access to a survey
   */
  async grantAccess(surveyId, userId, accessData) {
    const response = await http.post(`/surveys/${surveyId}/access`, {
      user_id: userId,
      ...accessData
    });
    return response.data;
  },

  /**
   * Revoke access to a survey
   */
  async revokeAccess(surveyId, userId) {
    const response = await http.delete(`/surveys/${surveyId}/access/${userId}`);
    return response.data;
  },

  /**
   * Get access grants for a survey
   */
  async getSurveyAccess(surveyId) {
    const response = await http.get(`/surveys/${surveyId}/access`);
    return response.data?.data || [];
  },

  /**
   * Get access grants for a survey (alias for compatibility)
   */
  async getSurveyAccessGrants(surveyId) {
    return this.getSurveyAccess(surveyId);
  },

  /**
   * Get surveys user has access to
   */
  async getMyAccessibleSurveys() {
    const response = await http.get('/surveys/my-accessible');
    return response.data?.data || [];
  },

  /**
   * Get user's access level for a specific survey
   */
  async getMyAccess(surveyId) {
    const response = await http.get(`/surveys/${surveyId}/my-access`);
    return response.data?.data;
  }
};

export default SurveyAccessService;