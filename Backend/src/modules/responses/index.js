// modules/responses/index.js
const responseRoutes = require('./routes/response.routes');
const responseController = require('./controller/response.controller');
const responseService = require('./service/response.service');

module.exports = {
  routes: responseRoutes,
  controller: responseController,
  service: responseService
};
