// src/models/surveyResponse.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyResponse = sequelize.define(
    'SurveyResponse',
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
      respondent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      collector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completion_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('started', 'completed', 'abandoned'),
        defaultValue: 'started',
      },
      time_taken: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time taken in seconds'
      },
      // Identity tracking fields for Survey Access Control
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this response is anonymous'
      },
      respondent_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Email of identified respondent'
      },
      respondent_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Name of identified respondent'
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
      tableName: 'survey_responses',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SurveyResponse;
};
