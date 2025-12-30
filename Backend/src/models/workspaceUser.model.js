// src/models/workspaceUser.model.js
module.exports = (sequelize, DataTypes) => {
  const WorkspaceUser = sequelize.define(
    'WorkspaceUser',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'workspaces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.ENUM('admin', 'member', 'viewer'),
        allowNull: false,
        defaultValue: 'member',
        comment: 'Role of user in workspace'
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'workspace_users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['workspace_id', 'user_id'],
          name: 'workspace_user_unique'
        }
      ]
    }
  );

  return WorkspaceUser;
};