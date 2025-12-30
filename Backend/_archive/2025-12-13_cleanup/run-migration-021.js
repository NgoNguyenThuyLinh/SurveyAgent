// run-migration-021.js - Add survey access control table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration021() {
  let connection;
  
  try {
    console.log(' Connecting to MySQL...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'allmtags_survey'
    });
    
    console.log(' Connected to MySQL');
    
    // Migration 021: Create survey access table
    const migration021 = `
      CREATE TABLE IF NOT EXISTS survey_access (
          id INT AUTO_INCREMENT PRIMARY KEY,
          survey_id INT NOT NULL,
          user_id INT NOT NULL,
          access_type ENUM('full', 'view', 'respond') NOT NULL DEFAULT 'respond',
          granted_by INT NOT NULL,
          expires_at DATETIME NULL,
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_survey_user_access (survey_id, user_id),
          KEY idx_survey_access_survey_id (survey_id),
          KEY idx_survey_access_user_id (user_id),
          KEY idx_survey_access_type (access_type),
          KEY idx_survey_access_active (is_active, expires_at),
          KEY idx_survey_access_granted_by (granted_by),
          
          FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    console.log(' Creating survey_access table...');
    await connection.execute(migration021);
    console.log(' Migration 021 applied successfully!');
    
  } catch (error) {
    console.error(' Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log(' MySQL connection closed');
    }
  }
}

// Run migration
runMigration021().catch(console.error);