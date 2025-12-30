// src/models/workspace.model.js
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define(
    'Workspace',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'private',
        comment: 'public = anyone can join, private = invite only'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'workspaces',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Workspace;
};





