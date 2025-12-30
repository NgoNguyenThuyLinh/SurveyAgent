// src/models/analysisResult.model.js
module.exports = (sequelize, DataTypes) => {
  const AnalysisResult = sequelize.define(
    'AnalysisResult',
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
      analysis_type: {
        type: DataTypes.ENUM('sentiment', 'theme_extraction', 'summary', 'comparison'),
        allowNull: false,
      },
      result_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      generated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'analysis_results',
      timestamps: false,
    }
  );

  return AnalysisResult;
};
