// Direct table creation with correct credentials
const mysql = require('mysql2/promise');

const createTablesSQL = [
  // Workspaces
  `CREATE TABLE IF NOT EXISTS workspaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE,
    owner_id INT NOT NULL,
    settings JSON,
    is_active BOOLEAN DEFAULT TRUE,
    member_count INT DEFAULT 1,
    survey_count INT DEFAULT 0,
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 1073741824,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_is_active (is_active),
    CONSTRAINT fk_workspaces_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Workspace Members
  `CREATE TABLE IF NOT EXISTS workspace_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    permissions JSON,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    UNIQUE KEY uq_workspace_user (workspace_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    CONSTRAINT fk_workspace_members_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Workspace Users (new system)
  `CREATE TABLE IF NOT EXISTS workspace_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    access_level ENUM('read', 'write', 'admin') DEFAULT 'read',
    invited_by INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_workspace_users_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_users_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_users_invited_by FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Workspace Invitations
  `CREATE TABLE IF NOT EXISTS workspace_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    inviter_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    token VARCHAR(64) UNIQUE NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_token (token),
    CONSTRAINT fk_workspace_invitations_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_invitations_inviter FOREIGN KEY (inviter_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Workspace Activities
  `CREATE TABLE IF NOT EXISTS workspace_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    metadata JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_workspace_activities_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_activities_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Chat Conversations
  `CREATE TABLE IF NOT EXISTS chat_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    context ENUM('general', 'survey_creation', 'analysis') DEFAULT 'general',
    ai_model VARCHAR(50) DEFAULT 'gemini',
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    metadata JSON,
    message_count INT DEFAULT 0,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_chat_conversations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Chat Messages
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type ENUM('user', 'ai') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'survey') DEFAULT 'text',
    attachments JSON,
    ai_metadata JSON,
    tokens_used INT,
    response_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_type (sender_type),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_chat_messages_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analysis Results
  `CREATE TABLE IF NOT EXISTS analysis_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    data JSON NOT NULL,
    insights JSON,
    charts_config JSON,
    generated_by ENUM('system', 'ai', 'user') DEFAULT 'system',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_survey_id (survey_id),
    INDEX idx_analysis_type (analysis_type),
    CONSTRAINT fk_analysis_results_survey FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Survey Access
  `CREATE TABLE IF NOT EXISTS survey_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id INT NOT NULL,
    access_type ENUM('view', 'respond', 'manage') NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_survey_id (survey_id),
    INDEX idx_user_id (user_id),
    INDEX idx_access_type (access_type),
    CONSTRAINT fk_survey_access_survey FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE,
    CONSTRAINT fk_survey_access_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_survey_access_granted_by FOREIGN KEY (granted_by) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Add workspace_id to surveys if not exists
  `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS workspace_id INT DEFAULT NULL`,
  `ALTER TABLE surveys ADD INDEX IF NOT EXISTS idx_workspace_id (workspace_id)`,
  `ALTER TABLE surveys ADD CONSTRAINT IF NOT EXISTS fk_surveys_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE SET NULL`
];

async function createMissingTables() {
  let connection;
  
  try {
    console.log(' Connecting to MySQL...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Tuanpham@781',
      database: 'nckh'
    });
    
    console.log(' Connected to MySQL database: nckh\n');
    
    // Show current tables
    const [currentTables] = await connection.execute('SHOW TABLES');
    const tableNames = currentTables.map(t => Object.values(t)[0]).sort();
    console.log(` Current tables (${tableNames.length}):`);
    tableNames.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    console.log('\n Creating missing tables...');
    
    let created = 0;
    let skipped = 0;
    
    for (let i = 0; i < createTablesSQL.length; i++) {
      const sql = createTablesSQL[i];
      try {
        await connection.execute(sql);
        
        if (sql.includes('CREATE TABLE')) {
          const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
          console.log(`    Created/verified: ${tableName}`);
          created++;
        } else {
          console.log(`    Executed: ${sql.substring(0, 50)}...`);
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          skipped++;
        } else {
          console.log(`     ${error.message}`);
        }
      }
    }
    
    // Show final table count
    const [finalTables] = await connection.execute('SHOW TABLES');
    const finalTableNames = finalTables.map(t => Object.values(t)[0]).sort();
    
    console.log(`\n Summary:`);
    console.log(`    Tables created/verified: ${created}`);
    console.log(`    Total tables now: ${finalTableNames.length}`);
    
    console.log(`\n Final table list:`);
    finalTableNames.forEach((table, index) => {
      const isNew = !tableNames.includes(table);
      console.log(`   ${index + 1}. ${table} ${isNew ? '' : ''}`);
    });
    
    console.log('\n Database setup completed successfully!');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMissingTables();