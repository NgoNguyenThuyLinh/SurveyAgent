-- Migration: Update survey_responses for anonymous submissions
-- Description: Add fields for anonymous/public response tracking

USE NCKH;

-- Add columns for anonymous responses
ALTER TABLE survey_responses 
ADD COLUMN respondent_identifier VARCHAR(255) DEFAULT NULL AFTER respondent_id,
ADD COLUMN collector_id INT DEFAULT NULL AFTER respondent_identifier,
ADD COLUMN submitted_at DATETIME DEFAULT NULL AFTER completion_time;

-- Add foreign key for collector
ALTER TABLE survey_responses
ADD CONSTRAINT fk_collector
FOREIGN KEY (collector_id) REFERENCES survey_collectors(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_respondent_identifier ON survey_responses(respondent_identifier);
CREATE INDEX idx_collector_id ON survey_responses(collector_id);

-- Make respondent_id nullable for anonymous responses
ALTER TABLE survey_responses
MODIFY COLUMN respondent_id INT NULL;
