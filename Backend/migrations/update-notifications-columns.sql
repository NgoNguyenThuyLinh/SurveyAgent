-- Add new columns to notifications table for professional notification system

-- Related entities
ALTER TABLE `notifications` 
ADD COLUMN `related_survey_id` INT NULL AFTER `message`,
ADD COLUMN `related_workspace_id` INT NULL AFTER `related_survey_id`,
ADD COLUMN `related_response_id` INT NULL AFTER `related_workspace_id`,
ADD COLUMN `related_user_id` INT NULL AFTER `related_response_id`;

-- Action URL
ALTER TABLE `notifications`
ADD COLUMN `action_url` VARCHAR(500) NULL AFTER `related_id`;

-- Actor information
ALTER TABLE `notifications`
ADD COLUMN `actor_id` INT NULL AFTER `action_url`,
ADD COLUMN `actor_name` VARCHAR(255) NULL AFTER `actor_id`,
ADD COLUMN `actor_avatar` VARCHAR(500) NULL AFTER `actor_name`;

-- Status
ALTER TABLE `notifications`
ADD COLUMN `is_archived` BOOLEAN DEFAULT FALSE AFTER `is_read`;

-- Metadata
ALTER TABLE `notifications`
ADD COLUMN `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' AFTER `read_at`,
ADD COLUMN `category` VARCHAR(50) NULL AFTER `priority`,
ADD COLUMN `metadata` JSON NULL AFTER `category`;

-- Add foreign keys
ALTER TABLE `notifications`
ADD CONSTRAINT `fk_notifications_survey` 
  FOREIGN KEY (`related_survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_notifications_workspace` 
  FOREIGN KEY (`related_workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_notifications_actor` 
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX `idx_user_unread` ON `notifications` (`user_id`, `is_read`, `created_at`);
CREATE INDEX `idx_user_category` ON `notifications` (`user_id`, `category`);
CREATE INDEX `idx_created_at` ON `notifications` (`created_at`);

-- Update type enum to include new notification types
ALTER TABLE `notifications` 
MODIFY COLUMN `type` ENUM(
  'survey_created',
  'survey_shared',
  'survey_response',
  'workspace_invite',
  'workspace_survey_added',
  'workspace_invitation',
  'workspace_member_added',
  'survey_invitation',
  'collector_created',
  'response_completed',
  'mention',
  'comment',
  'deadline_reminder'
) NOT NULL;
