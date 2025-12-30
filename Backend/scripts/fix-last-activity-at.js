const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize sequelize with env variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'llm_survey_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'rootpassword',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql'
  }
);

async function fixLastActivityAt() {
  try {
    console.log('Adding last_activity_at column to survey_responses...');
    
    // Check if column exists
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'survey_responses' 
      AND TABLE_SCHEMA = 'llm_survey_db' 
      AND COLUMN_NAME = 'last_activity_at'
    `;
    
    const [rows] = await sequelize.query(checkColumnQuery);
    
    if (rows.length > 0) {
      console.log(' Column last_activity_at already exists');
      return;
    }
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE survey_responses 
      ADD COLUMN last_activity_at DATETIME NULL 
      AFTER completed_at
    `;
    
    await sequelize.query(addColumnQuery);
    console.log(' Column last_activity_at added successfully');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error adding column:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixLastActivityAt();
