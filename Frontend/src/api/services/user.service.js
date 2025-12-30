// src/api/services/user.service.js - User management API service
import http from '../http';

const UserService = {
  /**
   * Get all users (admin only)
   */
  async getAll(params = {}) {
    const response = await http.get('/users', { params });
    return response.data;
  },

  // Alias for compatibility
  async getAllUsers(params = {}) {
    return this.getAll(params);
  },

  /**
   * Get user by ID
   */
  async getById(id) {
    const response = await http.get(`/users/${id}`);
    return response.data;
  },

  // Alias for compatibility
  async getUserById(id) {
    return this.getById(id);
  },

  /**
   * Create new user
   */
  async create(userData) {
    const response = await http.post('/users', userData);
    return response.data;
  },

  /**
   * Update user
   */
  async update(id, userData) {
    const response = await http.put(`/users/${id}`, userData);
    return response.data;
  },

  // Alias for compatibility
  async updateUser(id, userData) {
    return this.update(id, userData);
  },

  /**
   * Delete user (admin only)
   */
  async delete(id) {
    const response = await http.delete(`/users/${id}`);
    return response.data;
  },

  // Alias for compatibility
  async deleteUser(id) {
    return this.delete(id);
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(id, role) {
    const response = await http.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Get user role statistics (admin only)
   */
  async getRoleStats() {
    const response = await http.get('/users/role-stats');
    return response.data;
  },

  /**
   * Get user statistics (admin only)
   */
  async getUserStats() {
    const response = await http.get('/users/stats');
    return response.data;
  },
};

export default UserService;
