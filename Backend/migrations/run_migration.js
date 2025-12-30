// Sequelize migration to extend notifications.type enum
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE notifications 
            MODIFY COLUMN type ENUM(
                'workspace_invitation',
                'workspace_member_added', 
                'survey_response',
                'survey_shared',
                'survey_invitation',
                'collector_created',
                'response_completed'
            ) NOT NULL
        `);
    },

    down: async (queryInterface, Sequelize) => {
        // Revert to original enum without 'survey_invitation' if needed
        await queryInterface.sequelize.query(`
            ALTER TABLE notifications 
            MODIFY COLUMN type ENUM(
                'workspace_invitation',
                'workspace_member_added', 
                'survey_response',
                'survey_shared',
                'collector_created',
                'response_completed'
            ) NOT NULL
        `);
    }
};
