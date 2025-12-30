// src/models/surveyTemplate.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyTemplate = sequelize.define(
    'SurveyTemplate',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'archived'),
        defaultValue: 'draft',
      },
      is_archived: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: 'Soft delete flag: 0=active, 1=archived'
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
      tableName: 'survey_templates',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SurveyTemplate;
};
