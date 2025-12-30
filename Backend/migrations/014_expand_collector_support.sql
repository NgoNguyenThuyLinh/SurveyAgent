-- Migration 014: Expand SurveyCollector to support multi-source distribution
-- Add access control, workspace support, and permission modes

ALTER TABLE survey_collectors
ADD COLUMN access_level ENUM('public', 'workspace', 'custom') DEFAULT 'public' AFTER created_by,
ADD COLUMN workspace_id INT NULL AFTER access_level,
ADD COLUMN permission_mode ENUM('automatic', 'manual_invite', 'email_invitation') DEFAULT 'automatic' AFTER workspace_id,
ADD COLUMN target_user_ids JSON NULL COMMENT 'Array of user IDs for custom targeting' AFTER permission_mode,
ADD COLUMN description TEXT NULL AFTER target_user_ids,
ADD COLUMN metadata JSON NULL COMMENT 'Flexible config: mailingListId, tags, etc' AFTER description,
ADD COLUMN expires_at DATETIME NULL COMMENT 'Auto-deactivate after this date' AFTER metadata,
ADD COLUMN deleted_at DATETIME NULL AFTER expires_at;

-- Add foreign key for workspace_id
ALTER TABLE survey_collectors
ADD CONSTRAINT fk_collector_workspace 
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

-- Add indexes for common queries
CREATE INDEX idx_collector_access_level ON survey_collectors(access_level);
CREATE INDEX idx_collector_workspace_id ON survey_collectors(workspace_id);
CREATE INDEX idx_collector_permission_mode ON survey_collectors(permission_mode);
CREATE INDEX idx_collector_expires_at ON survey_collectors(expires_at);
CREATE INDEX idx_collector_deleted_at ON survey_collectors(deleted_at);

-- Note: Backward compatibility
-- Existing collectors automatically have:
--   access_level='public' (default)
--   workspace_id=NULL
--   permission_mode='automatic' (no invitation required)
