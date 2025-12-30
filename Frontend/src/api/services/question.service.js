// src/api/services/question.service.js - Question API service
import http from '../http';

const QuestionService = {
  /**
   * Create new question
   */
  async create(questionData) {
    const response = await http.post('/questions', questionData);
    return response.data;
  },

  /**
   * Update question
   */
  async update(questionId, questionData) {
    const response = await http.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

  /**
   * Delete question
   */
  async delete(questionId) {
    const response = await http.delete(`/questions/${questionId}`);
    return response.data;
  },

  /**
   * Add option to question
   */
  async addOption(optionData) {
    const response = await http.post('/options', optionData);
    return response.data;
  },

  /**
   * Update option
   */
  async updateOption(optionId, optionData) {
    const response = await http.put(`/options/${optionId}`, optionData);
    return response.data;
  },

  /**
   * Delete option
   */
  async deleteOption(optionId) {
    const response = await http.delete(`/options/${optionId}`);
    return response.data;
  },
};

export default QuestionService;
