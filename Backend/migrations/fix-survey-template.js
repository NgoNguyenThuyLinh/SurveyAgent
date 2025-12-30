// Sequelize migration to make surveys.template_id nullable
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE surveys MODIFY template_id INT NULL');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to NOT NULL if needed (assumes existing values)
    await queryInterface.sequelize.query('ALTER TABLE surveys MODIFY template_id INT NOT NULL');
  }
};