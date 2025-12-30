const axios = require('axios');
const logger = require('../../../../src/utils/logger');

class TrainedModelService {
    constructor() {
        this.apiUrl = process.env.TRAINED_MODEL_API_URL || 'http://localhost:8001/api';
        this.timeout = 30000;
    }

    async checkHealth() {
        try {
            const response = await axios.get(`${this.apiUrl}/health`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            logger.error('Trained model health check failed:', error.message);
            return { status: 'error', error: error.message };
        }
    }

    async getModelInfo() {
        try {
            const response = await axios.get(`${this.apiUrl}/model/info`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            logger.error('Failed to get model info:', error.message);
            return { success: false, error: error.message };
        }
    }

    async generateQuestions(keyword, numQuestions = 5, category = null) {
        try {
            const payload = {
                keyword: keyword,
                num_questions: numQuestions
            };

            if (category) {
                payload.category = category;
            }

            logger.info(`Generating questions for keyword: ${keyword}`);

            const response = await axios.post(`${this.apiUrl}/questions/generate`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            return response.data;
        } catch (error) {
            logger.error('Question generation failed:', error.message);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message,
                questions: []
            };
        }
    }

    async predictCategory(keyword) {
        try {
            const response = await axios.post(`${this.apiUrl}/predict/category`, {
                keyword: keyword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            return response.data;
        } catch (error) {
            logger.error('Category prediction failed:', error.message);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message 
            };
        }
    }

    async batchGenerateQuestions(keywords, numQuestions = 5) {
        try {
            const response = await axios.post(`${this.apiUrl}/questions/batch`, {
                keywords: keywords,
                num_questions: numQuestions
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout * 2 // Longer timeout for batch operations
            });

            return response.data;
        } catch (error) {
            logger.error('Batch question generation failed:', error.message);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message 
            };
        }
    }

    async isAvailable() {
        const health = await this.checkHealth();
        return health.status === 'ok' || health.status === 'healthy';
    }

    async getCategories() {
        try {
            const modelInfo = await this.getModelInfo();
            if (modelInfo.success && modelInfo.categories) {
                return modelInfo.categories;
            }
            // Default categories if not available from model
            return ['it', 'marketing', 'economics', 'general'];
        } catch (error) {
            logger.error('Failed to get categories:', error.message);
            return ['it', 'marketing', 'economics', 'general'];
        }
    }
}

module.exports = TrainedModelService;

