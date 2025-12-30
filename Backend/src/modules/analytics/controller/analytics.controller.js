const analyticsService = require('../service/analytics.service');

class AnalyticsController {
    async getOverview(req, res) {
        try {
            const { surveyId } = req.params;
            const data = await analyticsService.getOverview(surveyId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getQuestionAnalysis(req, res) {
        try {
            const { surveyId } = req.params;
            const data = await analyticsService.getQuestionAnalysis(surveyId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getSegmentAnalysis(req, res) {
        try {
            const { surveyId } = req.params;
            const { groupBy, filterQuestionId, filterOptionId } = req.query;
            const data = await analyticsService.getSegmentAnalysis(surveyId, groupBy, filterQuestionId, filterOptionId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getDropOffAnalysis(req, res) {
        try {
            const { surveyId } = req.params;
            const data = await analyticsService.getDropOffAnalysis(surveyId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAiInsights(req, res) {
        try {
            const { surveyId } = req.params;
            const data = await analyticsService.getAiInsights(surveyId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAdminDashboard(req, res) {
        try {
            const data = await analyticsService.getAdminDashboard();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getQualityScore(req, res) {
        try {
            const { surveyId } = req.params;
            const data = await require('../service/quality.service').calculateQualityScore(surveyId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async chatWithData(req, res) {
        try {
            const { surveyId } = req.params;
            const { question } = req.body;

            if (!question) {
                return res.status(400).json({ success: false, message: 'Question is required' });
            }

            const answer = await analyticsService.chatWithData(surveyId, question);
            res.json({ success: true, data: { answer } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getCreatorDashboard(req, res) {
        try {
            const userId = req.user.id;
            const data = await analyticsService.getCreatorDashboard(userId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AnalyticsController();
