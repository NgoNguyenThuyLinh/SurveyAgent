'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('workspace_activities')) {
      console.log(' workspace_activities table already exists');
      return;
    }

    await queryInterface.createTable('workspace_activities', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      workspace_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'workspaces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM(
          'created', 'joined', 'left', 'survey_created', 
          'survey_updated', 'survey_deleted', 'member_invited', 'member_removed',
          'workspace_updated', 'workspace_deleted', 'invitation_sent', 'invitation_resent', 'invitation_cancelled'
        ),
        allowNull: false,
      },
      target_type: {
        type: Sequelize.ENUM('user', 'survey', 'workspace'),
        allowNull: true,
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('workspace_activities', ['workspace_id'], {
      name: 'idx_workspace_activities_workspace_id'
    });
    await queryInterface.addIndex('workspace_activities', ['user_id'], {
      name: 'idx_workspace_activities_user_id'
    });
    await queryInterface.addIndex('workspace_activities', ['action'], {
      name: 'idx_workspace_activities_action'
    });
    await queryInterface.addIndex('workspace_activities', ['created_at'], {
      name: 'idx_workspace_activities_created_at'
    });

    console.log(' Created workspace_activities table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('workspace_activities');
  }
};
