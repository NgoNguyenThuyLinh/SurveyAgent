-- Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Target user
  `user_id` INT NOT NULL,
  
  -- Notification type & content
  `type` ENUM(
    'survey_created',
    'survey_shared', 
    'survey_response',
    'workspace_invite',
    'workspace_survey_added',
    'mention',
    'comment',
    'deadline_reminder'
  ) NOT NULL,
  
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT,
  
  -- Related entities (for routing)
  `related_survey_id` INT NULL,
  `related_workspace_id` INT NULL,
  `related_response_id` INT NULL,
  `related_user_id` INT NULL,
  
  -- Action URL (where to navigate on click)
  `action_url` VARCHAR(500),
  
  -- Actor (who triggered this notification)
  `actor_id` INT NULL,
  `actor_name` VARCHAR(255),
  `actor_avatar` VARCHAR(500),
  
  -- Status
  `is_read` BOOLEAN DEFAULT FALSE,
  `is_archived` BOOLEAN DEFAULT FALSE,
  `read_at` TIMESTAMP NULL,
  
  -- Metadata
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `category` VARCHAR(50),
  `metadata` JSON,
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `idx_user_unread` (`user_id`, `is_read`, `created_at`),
  INDEX `idx_user_category` (`user_id`, `category`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`related_survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_preferences table (for future use)
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL UNIQUE,
  
  -- In-app notifications
  `in_app_enabled` BOOLEAN DEFAULT TRUE,
  
  -- Email notifications (for future)
  `email_enabled` BOOLEAN DEFAULT FALSE,
  `email_frequency` ENUM('instant', 'daily', 'weekly', 'never') DEFAULT 'never',
  
  -- Notification types preferences
  `notify_survey_created` BOOLEAN DEFAULT TRUE,
  `notify_survey_response` BOOLEAN DEFAULT TRUE,
  `notify_workspace_invite` BOOLEAN DEFAULT TRUE,
  `notify_mentions` BOOLEAN DEFAULT TRUE,
  `notify_comments` BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
