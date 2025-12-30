'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.reset_password_token) {
      await queryInterface.addColumn('users', 'reset_password_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDesc.reset_password_expires) {
      await queryInterface.addColumn('users', 'reset_password_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    if (tableDesc.reset_password_expires) {
      await queryInterface.removeColumn('users', 'reset_password_expires');
    }
    if (tableDesc.reset_password_token) {
      await queryInterface.removeColumn('users', 'reset_password_token');
    }
  }
};
