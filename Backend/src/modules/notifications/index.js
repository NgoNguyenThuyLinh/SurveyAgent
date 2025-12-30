// src/modules/notifications/index.js
const notificationRoutes = require('./routes/notification.routes');
const notificationController = require('./controller/notification.controller');
const notificationService = require('./service/notification.service');

module.exports = {
  routes: notificationRoutes,
  controller: notificationController,
  service: notificationService
};
