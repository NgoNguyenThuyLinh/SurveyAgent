-- Migration to add survey_invitation to notification type enum
-- File: migrations/XXX_add_survey_invitation_notification_type.sql

ALTER TABLE notifications 
MODIFY COLUMN type ENUM(
  'workspace_invitation',
  'workspace_member_added', 
  'survey_response',
  'survey_shared',
  'survey_invitation',
  'collector_created',
  'response_completed'
) NOT NULL;
