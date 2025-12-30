// create-admin-with-bcrypt.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdminWithBcrypt() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'llm_survey_user',
    password: 'password123',
    database: 'llm_survey_db'
  });

  try {
    // Create proper bcrypt hash for 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update existing admin password or create new
    const result = await connection.execute(`
      UPDATE users SET password = ? WHERE email = ?
    `, [hashedPassword, 'admin@example.com']);
    
    if (result[0].affectedRows === 0) {
      // Create new admin if doesn't exist
      await connection.execute(`
        INSERT INTO users (username, email, password, full_name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, ['admin', 'admin@example.com', hashedPassword, 'System Administrator', 'admin']);
    }
    
    console.log(' Admin user created successfully: admin@example.com / admin123');
    console.log(' Password hash:', hashedPassword);
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await connection.end();
  }
}

createAdminWithBcrypt();