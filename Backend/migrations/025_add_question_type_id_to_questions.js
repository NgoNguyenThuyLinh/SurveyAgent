// Sequelize migration wrapper so sequelize-cli can run this file
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Use raw query to add column if missing
        const dbName = queryInterface.sequelize.config.database;
        const [rows] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'question_type_id'`,
            { replacements: { db: dbName } }
        );

        if (rows.length === 0) {
            await queryInterface.sequelize.query(
                `ALTER TABLE questions ADD COLUMN question_type_id INT NULL`
            );
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Drop the column if it exists
        const dbName = queryInterface.sequelize.config.database;
        const [rows] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'question_type_id'`,
            { replacements: { db: dbName } }
        );

        if (rows.length > 0) {
            await queryInterface.sequelize.query(
                `ALTER TABLE questions DROP COLUMN question_type_id`
            );
        }
    }
};
