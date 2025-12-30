-- Migration 013: Add soft delete to surveys and audit_logs table
-- Enable soft deletes for surveys and add comprehensive audit trail

-- Add soft delete columns to surveys table
ALTER TABLE surveys
ADD COLUMN deleted_at DATETIME NULL AFTER updated_at,
ADD COLUMN deleted_by INT NULL AFTER deleted_at;

-- Add foreign key for deleted_by
ALTER TABLE surveys
ADD CONSTRAINT fk_survey_deleted_by 
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for soft delete queries
CREATE INDEX idx_survey_deleted_at ON surveys(deleted_at);

-- Create audit_logs table for comprehensive tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL COMMENT 'survey, collector, response, user, etc',
    entity_id INT NOT NULL COMMENT 'ID of the entity',
    action VARCHAR(50) NOT NULL COMMENT 'created, updated, deleted, soft_deleted, etc',
    performed_by INT NOT NULL,
    old_values JSON COMMENT 'Previous state of entity',
    new_values JSON COMMENT 'New state of entity',
    description TEXT COMMENT 'Human readable description',
    ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6',
    user_agent TEXT COMMENT 'Browser/client info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
