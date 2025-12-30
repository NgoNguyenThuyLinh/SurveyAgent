// src/models/llmInteraction.model.js
module.exports = (sequelize, DataTypes) => {
  const LlmInteraction = sequelize.define(
    'LlmInteraction',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      prompt_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      custom_prompt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tokens_used: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      model_used: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      interaction_type: {
        type: DataTypes.ENUM('survey_generation', 'analysis', 'summary', 'recommendation', 'question_generation', 'category_prediction'),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'llm_interactions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return LlmInteraction;
};
