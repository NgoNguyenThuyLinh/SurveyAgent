// src/models/surveyAccess.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyAccess = sequelize.define(
    'SurveyAccess',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      access_type: {
        type: DataTypes.ENUM('full', 'view', 'respond'),
        defaultValue: 'respond',
        comment: 'full: can edit/manage, view: can view results, respond: can only respond'
      },
      granted_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who granted this access'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Access expiration date (null = no expiration)'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about this access grant'
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
      tableName: 'survey_access',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['survey_id', 'user_id'],
          name: 'unique_survey_user_access',
        },
        {
          fields: ['survey_id'],
          name: 'idx_survey_access_survey_id',
        },
        {
          fields: ['user_id'],
          name: 'idx_survey_access_user_id',
        },
        {
          fields: ['access_type'],
          name: 'idx_survey_access_type',
        }
      ],
    }
  );

  return SurveyAccess;
};