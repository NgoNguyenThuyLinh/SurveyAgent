// src/models/surveyInvite.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyInvite = sequelize.define(
    'SurveyInvite',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'responded', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
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
      tableName: 'survey_invites',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['survey_id']
        },
        {
          fields: ['email']
        },
        {
          fields: ['token'],
          unique: true
        },
        {
          fields: ['survey_id', 'email'],
          unique: true,
          name: 'survey_email_unique'
        }
      ]
    }
  );

  return SurveyInvite;
};