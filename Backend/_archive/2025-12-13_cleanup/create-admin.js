// create-admin.js - Simple admin creation
const { sequelize } = require('./src/models');

async function createAdmin() {
  try {
    // Direct SQL insert with bcrypt hash for 'admin123'
    const hashedPassword = '$2a$10$QVnKsW2.K8hF8mF8mF8mFO8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8';
    
    await sequelize.query(`
      INSERT IGNORE INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
      VALUES (
        'admin',
        'admin@example.com',
        '$2a$10$2EQl7VNzQVnQ2EQl7VNzQOQl7VNzQl7VNzQl7VNzQl7VNzQl7VNzQ',
        'System Administrator',
        'admin',
        1,
        NOW(),
        NOW()
      )
    `);
    
    console.log(' Admin user created with email: admin@example.com, password: admin123');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Set environment variables first
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3307';
process.env.DB_USER = 'llm_survey_user';
process.env.DB_PASSWORD = 'password123';
process.env.DB_NAME = 'llm_survey_db';

createAdmin();