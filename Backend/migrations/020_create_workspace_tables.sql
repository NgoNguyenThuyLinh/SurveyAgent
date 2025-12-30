-- Migration 020: Create Workspace tables
-- Purpose: Create tables for workspace feature (multi-tenant collaboration)

-- Create workspaces table
CREATE TABLE IF NOT EXISTS `workspaces` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `owner_id` INT NOT NULL,
  `visibility` ENUM('public', 'private') DEFAULT 'private' COMMENT 'public = anyone can join, private = invite only',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_visibility` (`visibility`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_workspaces_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS `workspace_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `role` ENUM('owner', 'editor', 'viewer') DEFAULT 'viewer' COMMENT 'owner=full access, editor=create/edit surveys, viewer=read-only',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY `uq_workspace_user` (`workspace_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role` (`role`),
  CONSTRAINT `fk_workspace_members_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_workspace_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create workspace_invitations table
CREATE TABLE IF NOT EXISTS `workspace_invitations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT NOT NULL,
  `invitee_email` VARCHAR(255) NOT NULL,
  `invited_by` INT NOT NULL,
  `role` ENUM('editor', 'viewer') DEFAULT 'viewer',
  `token` VARCHAR(255) UNIQUE,
  `status` ENUM('pending', 'accepted', 'declined', 'cancelled') DEFAULT 'pending',
  `expires_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `idx_workspace_id` (`workspace_id`),
  KEY `idx_invitee_email` (`invitee_email`),
  KEY `idx_status` (`status`),
  KEY `idx_token` (`token`),
  CONSTRAINT `fk_workspace_invitations_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_workspace_invitations_invited_by` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create workspace_activities table (audit log)
CREATE TABLE IF NOT EXISTS `workspace_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT NOT NULL,
  `user_id` INT,
  `action` VARCHAR(50) COMMENT 'member_added, member_removed, survey_created, survey_deleted, etc.',
  `description` TEXT,
  `data` JSON COMMENT 'Additional context as JSON',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY `idx_workspace_id` (`workspace_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_workspace_activities_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_workspace_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add workspace_id to surveys table if not exists
ALTER TABLE `surveys` ADD COLUMN IF NOT EXISTS `workspace_id` INT DEFAULT NULL;
ALTER TABLE `surveys` ADD KEY IF NOT EXISTS `idx_workspace_id` (`workspace_id`);
ALTER TABLE `surveys` ADD CONSTRAINT IF NOT EXISTS `fk_surveys_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS `idx_workspaces_created_at` ON `workspaces`(`created_at`);
CREATE INDEX IF NOT EXISTS `idx_workspace_members_workspace_id` ON `workspace_members`(`workspace_id`);
CREATE INDEX IF NOT EXISTS `idx_workspace_invitations_workspace_id` ON `workspace_invitations`(`workspace_id`);
CREATE INDEX IF NOT EXISTS `idx_workspace_activities_workspace_id` ON `workspace_activities`(`workspace_id`);
