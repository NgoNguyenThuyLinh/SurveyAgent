// src/modules/workspaces/index.js
const workspaceRoutes = require('./routes/workspace.routes');
const workspaceController = require('./controller/workspace.controller');
const workspaceService = require('./service/workspace.service');

module.exports = {
  routes: workspaceRoutes,
  controller: workspaceController,
  service: workspaceService
};





