'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('workspace_invitations')) {
      console.log(' workspace_invitations table already exists');
      return;
    }

    await queryInterface.createTable('workspace_invitations', {
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
      inviter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      invitee_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      invitee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      role: {
        type: Sequelize.ENUM('collaborator', 'member', 'viewer'),
        defaultValue: 'member',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled'),
        defaultValue: 'pending',
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('workspace_invitations', ['workspace_id', 'invitee_email', 'status'], {
      name: 'unique_pending_invitation',
      unique: true,
      where: {
        status: 'pending'
      }
    });
    await queryInterface.addIndex('workspace_invitations', ['token'], {
      name: 'idx_workspace_invitations_token'
    });
    await queryInterface.addIndex('workspace_invitations', ['invitee_email'], {
      name: 'idx_workspace_invitations_invitee_email'
    });
    await queryInterface.addIndex('workspace_invitations', ['status'], {
      name: 'idx_workspace_invitations_status'
    });

    console.log(' Created workspace_invitations table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('workspace_invitations');
  }
};
