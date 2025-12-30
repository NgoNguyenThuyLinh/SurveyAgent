// modules/templates/index.js
const templateRoutes = require('./routes/template.routes');
const templateController = require('./controller/template.controller');
const templateService = require('./service/template.service');

module.exports = {
  routes: templateRoutes,
  controller: templateController,
  service: templateService
};
