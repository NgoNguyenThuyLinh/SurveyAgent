-- Migration: Make respondent_id nullable for anonymous responses
-- File: 010_make_respondent_id_nullable.sql

-- Drop the foreign key constraint temporarily
ALTER TABLE survey_responses 
DROP FOREIGN KEY survey_responses_ibfk_2;

-- Modify the column to allow NULL values
ALTER TABLE survey_responses 
MODIFY respondent_id INT NULL;

-- Add the foreign key constraint back with NULL support
ALTER TABLE survey_responses 
ADD CONSTRAINT survey_responses_ibfk_2 
FOREIGN KEY (respondent_id) REFERENCES users(id) ON DELETE SET NULL;

-- Update any existing records that might have invalid respondent_id
UPDATE survey_responses 
SET respondent_id = 1 
WHERE respondent_id IS NULL;