// scripts/run-chat-migration.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const sequelize = require('../src/config/database');

const runMigration = async () => {
  try {
    console.log('Running chat migration...');
    
    // Read and execute migration SQL
    const migrationPath = path.join(__dirname, '../migrations/008_create_chat_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await sequelize.query(statement);
      }
    }
    
    console.log(' Chat migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
