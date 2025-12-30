// modules/auth-rbac/index.js
const authRoutes = require('./routes/auth.routes');
const authController = require('./controller/auth.controller');
const authService = require('./service/auth.service');
const authMiddleware = require('./middleware/auth.middleware');

module.exports = {
  routes: authRoutes,
  controller: authController,
  service: authService,
  middleware: authMiddleware
};
