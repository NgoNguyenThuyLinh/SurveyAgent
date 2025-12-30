// src/models/surveyCollector.model.js
module.exports = (sequelize, DataTypes) => {
  const SurveyCollector = sequelize.define('SurveyCollector', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    survey_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      }
    },
    collector_type: {
      type: DataTypes.ENUM('web_link', 'qr_code', 'email', 'embedded'),
      defaultValue: 'web_link'
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    allow_multiple_responses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    response_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'survey_collectors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SurveyCollector;
};
