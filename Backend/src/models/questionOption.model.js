// src/models/questionOption.model.js
module.exports = (sequelize, DataTypes) => {
  const QuestionOption = sequelize.define(
    'QuestionOption',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order',
      },
    },
    {
      tableName: 'question_options',
      timestamps: false,
    }
  );

  return QuestionOption;
};
