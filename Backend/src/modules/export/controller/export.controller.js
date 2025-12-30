// src/modules/export/controller/export.controller.js
const exportService = require('../service/export.service');
const logger = require('../../../utils/logger');

class ExportController {
  /**
   * Export survey responses to CSV
   */
  async exportToCSV(req, res) {
    try {
      const { survey_id } = req.params;

      const data = await exportService.exportSurveyToCSV(survey_id, req.user);
      const csvString = exportService.convertToCSVString(data.headers, data.rows);

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="survey_${survey_id}_responses.csv"`);

      res.status(200).send(csvString);
    } catch (error) {
      logger.error('Export to CSV error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error exporting survey data'
      });
    }
  }

  /**
   * Export survey responses to JSON
   */
  async exportToJSON(req, res) {
    try {
      const { survey_id } = req.params;

      const data = await exportService.exportSurveyToCSV(survey_id, req.user);

      // Convert to JSON format
      const jsonData = {
        survey_id: survey_id,
        survey_title: data.survey_title,
        total_responses: data.total_responses,
        exported_at: new Date(),
        headers: data.headers,
        responses: data.rows.map((row, index) => {
          const obj = {};
          data.headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        })
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="survey_${survey_id}_responses.json"`);

      res.status(200).json(jsonData);
    } catch (error) {
      logger.error('Export to JSON error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error exporting survey data'
      });
    }
  }

  /**
   * Get export metadata
   */
  async getExportMetadata(req, res) {
    try {
      const { survey_id } = req.params;

      const metadata = await exportService.getExportMetadata(survey_id, req.user);

      res.status(200).json({
        success: true,
        data: metadata
      });
    } catch (error) {
      logger.error('Get export metadata error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching export metadata'
      });
    }
  }
}

module.exports = new ExportController();
