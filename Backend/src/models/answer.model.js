// src/models/answer.model.js
module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define(
    'Answer',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      survey_response_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      text_answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      numeric_answer: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'answers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return Answer;
};
