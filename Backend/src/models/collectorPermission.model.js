// src/models/collectorPermission.model.js
module.exports = (sequelize, DataTypes) => {
  const CollectorPermission = sequelize.define(
    'CollectorPermission',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      collector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'survey_collectors',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      invite_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Token for accepting invitation'
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'),
        defaultValue: 'pending'
      },
      invited_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Invitation expires after this time'
      }
    },
    {
      tableName: 'collector_permissions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'unique_permission',
          unique: true,
          fields: ['collector_id', 'user_id']
        }
      ]
    }
  );

  return CollectorPermission;
};
