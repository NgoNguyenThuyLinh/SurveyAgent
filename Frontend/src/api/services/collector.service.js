// src/api/services/collector.service.js - Collector API service
import http from '../http';

const CollectorService = {
  /**
   * Get all collectors for a survey
   */
  async getBySurvey(surveyId) {
    const response = await http.get(`/collectors/survey/${surveyId}`);
    return response.data.collectors || response.data.data?.collectors || [];
  },

  /**
   * Create new collector
   */
  async create(collectorData) {
    const { surveyId, ...data } = collectorData;
    if (!surveyId) {
      throw new Error('surveyId is required to create a collector');
    }
    const response = await http.post(`/collectors/survey/${surveyId}`, data);
    return response.data.collector || response.data.data?.collector || response.data.data;
  },

  // Legacy aliases for backward compatibility
  getCollectorsBySurvey(surveyId) {
    return this.getBySurvey(surveyId);
  },

  createCollector(collectorData) {
    return this.create(collectorData);
  },

  /**
   * Get collector by token (public access - no auth needed)
   */
  async getCollectorByToken(token) {
    const response = await http.get(`/collectors/token/${token}`);
    return response.data;
  },

  /**
   * Get collector by ID (authenticated)
   */
  async getCollectorById(id) {
    const response = await http.get(`/collectors/${id}`);
    return response.data;
  },

  /**
   * Update collector
   */
  async updateCollector(id, collectorData) {
    const response = await http.put(`/collectors/${id}`, collectorData);
    return response.data;
  },

  /**
   * Delete collector
   */
  async deleteCollector(id) {
    const response = await http.delete(`/collectors/${id}`);
    return response.data;
  },

  /**
   * Generate QR code URL for collector
   */
  getQRCodeURL(token) {
    const publicURL = `${window.location.origin}/collector/${token}`;
    return publicURL;
  },

  /**
   * Get public submission URL
   */
  getPublicURL(token) {
    return `${window.location.origin}/collector/${token}`;
  },

  /**
   * Create workspace collector for a survey
   */
  async createWorkspaceCollector(surveyId, collectorData) {
    const response = await http.post(`/collectors/survey/${surveyId}`, collectorData);
    return response.data;
  },
};

export default CollectorService;
