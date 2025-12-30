-- Migration 015: Create collector_permissions table
-- Support manual invitation and acceptance workflow

CREATE TABLE IF NOT EXISTS collector_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collector_id INT NOT NULL,
    user_id INT NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL COMMENT 'Token for accepting invitation',
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME NULL,
    expires_at DATETIME NULL COMMENT 'Invitation expires after this time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (collector_id) REFERENCES survey_collectors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_permission (collector_id, user_id),
    INDEX idx_status (status),
    INDEX idx_invite_token (invite_token),
    INDEX idx_user_id (user_id),
    INDEX idx_invited_at (invited_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
