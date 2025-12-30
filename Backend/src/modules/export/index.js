// modules/export/index.js
const exportRoutes = require('./routes/export.routes');
const exportController = require('./controller/export.controller');
const exportService = require('./service/export.service');

module.exports = {
  routes: exportRoutes,
  controller: exportController,
  service: exportService
};
