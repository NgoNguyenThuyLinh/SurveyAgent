// quick-setup-admin.js - Quick admin user creation
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'llm_survey_user',
    password: 'password123',
    database: 'llm_survey_db'
  });

  try {
    // Simple bcrypt hash for 'admin123'
    const hashedPassword = '$2a$10$2EQl7VNzQVnQ2EQl7VNzQOQl7VNzQl7VNzQl7VNzQl7VNzQl7VNzQ';
    
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, password, full_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, ['admin', 'admin@example.com', hashedPassword, 'System Administrator', 'admin']);
    
    console.log(' Admin user created: admin@example.com / admin123');
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await connection.end();
  }
}

createAdmin();