-- Migration 012: Enhance SurveyResponse with lifecycle tracking
-- Add status workflow, timestamps, and session tracking for better response management

-- Add status tracking columns to survey_responses
ALTER TABLE survey_responses
ADD COLUMN status ENUM('started', 'completed', 'abandoned') DEFAULT 'started' AFTER respondent_id,
ADD COLUMN started_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status,
ADD COLUMN completed_at DATETIME NULL AFTER started_at,
ADD COLUMN last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER completed_at;

-- Note: session_id already exists in the table from earlier migrations
-- We'll keep both for now and phase out the old start_time/completion_time eventually

-- Add indexes for performance on queries
CREATE INDEX idx_response_status ON survey_responses(status);
CREATE INDEX idx_response_started_at ON survey_responses(started_at);
CREATE INDEX idx_response_last_activity ON survey_responses(last_activity_at);
CREATE INDEX idx_response_completed_at ON survey_responses(completed_at);

-- This allows efficient queries for:
-- 1. Finding abandoned responses: WHERE status='started' AND last_activity_at < now() - INTERVAL 24 HOUR
-- 2. Finding completed responses: WHERE status='completed' ORDER BY completed_at DESC
-- 3. Finding recent activity: WHERE last_activity_at > now() - INTERVAL 7 DAY
