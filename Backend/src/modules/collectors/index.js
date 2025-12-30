// modules/collectors/index.js
const collectorRoutes = require('./routes/collector.routes');
const collectorController = require('./controller/collector.controller');
const collectorService = require('./service/collector.service');

module.exports = {
  routes: collectorRoutes,
  controller: collectorController,
  service: collectorService
};
