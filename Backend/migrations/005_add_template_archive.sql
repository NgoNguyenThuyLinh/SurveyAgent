-- Migration: Add is_archived column to survey_templates
-- Purpose: Allow archiving templates instead of deleting them when they're in use
-- Date: 2025-11-10

-- Add is_archived column (default to 0 = not archived)
ALTER TABLE survey_templates 
ADD COLUMN is_archived TINYINT(1) DEFAULT 0 AFTER status;

-- Add index for performance when filtering archived templates
CREATE INDEX idx_templates_archived ON survey_templates(is_archived);

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'llm_survey_db'
  AND TABLE_NAME = 'survey_templates'
  AND COLUMN_NAME = 'is_archived';
