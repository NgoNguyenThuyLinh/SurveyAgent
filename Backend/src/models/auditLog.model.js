// src/models/auditLog.model.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'survey, collector, response, user, etc'
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID of the entity'
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'created, updated, deleted, soft_deleted, etc'
      },
      performed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      old_values: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Previous state of entity'
      },
      new_values: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'New state of entity'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Human readable description'
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IPv4 or IPv6'
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/client info'
      }
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['entity_type', 'entity_id']
        },
        {
          fields: ['action']
        },
        {
          fields: ['performed_by']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );

  return AuditLog;
};
