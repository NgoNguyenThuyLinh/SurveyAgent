// src/models/surveyCollaborator.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyCollaborator = sequelize.define(
    'SurveyCollaborator',
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
      role: {
        type: DataTypes.ENUM('owner', 'editor', 'viewer'),
        defaultValue: 'editor',
      },
    },
    {
      tableName: 'survey_collaborators',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['survey_id', 'user_id'],
          name: 'unique_survey_user',
        },
      ],
    }
  );

  return SurveyCollaborator;
};





