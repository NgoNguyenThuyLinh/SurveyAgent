// modules/surveys/index.js
const surveyRoutes = require('./routes/survey.routes');
const surveyController = require('./controller/survey.controller');
const surveyService = require('./service/survey.service');
const inviteRoutes = require('./routes/surveyInvite.routes');

module.exports = {
  routes: surveyRoutes,
  controller: surveyController,
  service: surveyService
};
