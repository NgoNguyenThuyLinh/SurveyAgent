const mysql = require('mysql2/promise');

async function createRemainingTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Tuanpham@781',
    database: 'nckh'
  });

  try {
    console.log(' Creating remaining tables...\n');
    
    // Check if workspace_id exists in surveys
    const [columns] = await connection.execute('DESCRIBE surveys');
    const hasWorkspaceId = columns.some(col => col.Field === 'workspace_id');
    
    if (!hasWorkspaceId) {
      await connection.execute('ALTER TABLE surveys ADD COLUMN workspace_id INT DEFAULT NULL');
      await connection.execute('ALTER TABLE surveys ADD INDEX idx_workspace_id (workspace_id)');
      console.log(' Added workspace_id to surveys table');
    }
    
    // Create remaining tables
    const tables = [
      {
        name: 'notifications',
        sql: `CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type ENUM('system', 'survey_invite', 'workspace', 'response') NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          data JSON,
          is_read BOOLEAN DEFAULT FALSE,
          priority ENUM('high', 'normal', 'low') DEFAULT 'normal',
          action_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          INDEX idx_created_at (created_at),
          INDEX idx_type (type),
          CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      {
        name: 'survey_collectors',
        sql: `CREATE TABLE IF NOT EXISTS survey_collectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          survey_id INT NOT NULL,
          collector_type ENUM('web_link', 'email', 'qr_code', 'embed') DEFAULT 'web_link',
          name VARCHAR(255) NOT NULL,
          token VARCHAR(64) UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          allow_multiple_responses BOOLEAN DEFAULT FALSE,
          response_count INT DEFAULT 0,
          settings JSON,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_survey_id (survey_id),
          INDEX idx_token (token),
          INDEX idx_created_by (created_by),
          CONSTRAINT fk_survey_collectors_survey FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE,
          CONSTRAINT fk_survey_collectors_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      {
        name: 'survey_invites',
        sql: `CREATE TABLE IF NOT EXISTS survey_invites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          survey_id INT NOT NULL,
          email VARCHAR(100) NOT NULL,
          token VARCHAR(64) UNIQUE NOT NULL,
          status ENUM('pending', 'opened', 'completed') DEFAULT 'pending',
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          opened_at TIMESTAMP,
          completed_at TIMESTAMP,
          reminder_count INT DEFAULT 0,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_survey_id (survey_id),
          INDEX idx_email (email),
          INDEX idx_status (status),
          INDEX idx_token (token),
          CONSTRAINT fk_survey_invites_survey FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE,
          CONSTRAINT fk_survey_invites_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      }
    ];

    for (const table of tables) {
      try {
        await connection.execute(table.sql);
        console.log(` Created/verified: ${table.name}`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  Table ${table.name} already exists`);
        } else {
          console.log(` Error creating ${table.name}: ${error.message}`);
        }
      }
    }
    
    // Final table count
    const [finalTables] = await connection.execute('SHOW TABLES');
    const tableNames = finalTables.map(t => Object.values(t)[0]).sort();
    
    console.log(`\n Database now has ${tableNames.length} tables:`);
    tableNames.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    console.log('\n All tables created successfully!');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await connection.end();
  }
}

createRemainingTables();