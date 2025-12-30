-- Migration: Add 'cancelled' status to workspace_invitations
-- Description: Add support for cancelling workspace invitations

-- Modify the status ENUM to include 'cancelled'
ALTER TABLE `workspace_invitations` 
MODIFY COLUMN `status` ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled') 
DEFAULT 'pending';

-- Add index for cancelled status if not exists
ALTER TABLE `workspace_invitations` 
ADD INDEX `idx_status` (`status`);
