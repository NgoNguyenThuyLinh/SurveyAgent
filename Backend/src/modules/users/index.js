// src/modules/users/index.js
const routes = require('./routes/user.routes');
const controller = require('./controller/user.controller');
const service = require('./service/user.service');

module.exports = {
  routes,
  controller,
  service
};
