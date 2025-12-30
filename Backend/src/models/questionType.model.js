// src/models/questionType.model.js
module.exports = (sequelize, DataTypes) => {
  const QuestionType = sequelize.define(
    'QuestionType',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'type_name',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'question_types',
      timestamps: false,
    }
  );

  return QuestionType;
};
