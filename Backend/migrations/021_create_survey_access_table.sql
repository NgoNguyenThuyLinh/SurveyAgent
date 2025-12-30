-- 021_create_survey_access_table.sql
-- Add survey access control table for fine-grained permissions

CREATE TABLE survey_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id INT NOT NULL,
    access_type ENUM('full', 'view', 'respond') NOT NULL DEFAULT 'respond' COMMENT 'full: can edit/manage, view: can view results, respond: can only respond',
    granted_by INT NOT NULL COMMENT 'User ID who granted this access',
    expires_at DATETIME NULL COMMENT 'Access expiration date (null = no expiration)',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT NULL COMMENT 'Additional notes about this access grant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_survey_user_access (survey_id, user_id),
    KEY idx_survey_access_survey_id (survey_id),
    KEY idx_survey_access_user_id (user_id),
    KEY idx_survey_access_type (access_type),
    
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX idx_survey_access_active ON survey_access (is_active, expires_at);
CREATE INDEX idx_survey_access_granted_by ON survey_access (granted_by);