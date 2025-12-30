'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('survey_responses');
    
    // Add time_taken column if it doesn't exist
    if (!tableInfo.time_taken) {
      await queryInterface.addColumn('survey_responses', 'time_taken', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Time taken in seconds',
        after: 'status'
      });
      console.log(' Added time_taken column to survey_responses');
    } else {
      console.log(' time_taken column already exists in survey_responses');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('survey_responses', 'time_taken');
  }
};
