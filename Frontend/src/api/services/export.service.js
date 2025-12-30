// src/api/services/export.service.js - Export API service
import http from '../http';

const ExportService = {
  /**
   * Get export metadata for a survey
   */
  async getExportMetadata(surveyId) {
    const response = await http.get(`/export/surveys/${surveyId}/metadata`);
    return response.data;
  },

  /**
   * Export survey responses to CSV
   */
  async exportToCSV(surveyId, params = {}) {
    const response = await http.get(`/export/surveys/${surveyId}/csv`, {
      params,
      responseType: 'blob', // Important for file download
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey_${surveyId}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, message: 'CSV download started' };
  },

  /**
   * Export survey responses to JSON
   */
  async exportToJSON(surveyId, params = {}) {
    const response = await http.get(`/export/surveys/${surveyId}/json`, {
      params,
      responseType: 'blob', // Important for file download
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey_${surveyId}_responses.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, message: 'JSON download started' };
  },

  /**
   * Get preview of export data
   */
  async getExportPreview(surveyId, format = 'csv', params = {}) {
    const response = await http.get(`/export/surveys/${surveyId}/preview`, {
      params: { ...params, format },
    });
    return response.data;
  },
};

export default ExportService;
