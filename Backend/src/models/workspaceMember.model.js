// src/models/workspaceMember.model.js
module.exports = (sequelize, DataTypes) => {
  const WorkspaceMember = sequelize.define(
    'WorkspaceMember',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('owner', 'collaborator', 'member', 'viewer'),
        defaultValue: 'member',
        comment: 'owner=full control, collaborator=create/edit surveys, member=answer surveys, viewer=read-only'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'workspace_members',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['workspace_id', 'user_id'],
          name: 'unique_workspace_user',
        },
      ],
    }
  );

  return WorkspaceMember;
};





