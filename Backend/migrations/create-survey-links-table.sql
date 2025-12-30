-- Create survey_links table migration
CREATE TABLE IF NOT EXISTS survey_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  access_count INT DEFAULT 0,
  max_responses INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_survey_id (survey_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- Check if share_settings column exists, if not add it
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'surveys' 
  AND column_name = 'share_settings');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE surveys ADD COLUMN share_settings TEXT AFTER status', 
  'SELECT "Column share_settings already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if survey_id column exists in questions table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'questions' 
  AND column_name = 'survey_id');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN survey_id INT AFTER template_id', 
  'SELECT "Column survey_id already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if question_type column exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'questions' 
  AND column_name = 'question_type');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN question_type ENUM(''text'', ''multiple_choice'', ''yes_no'', ''rating'', ''date'', ''email'') DEFAULT ''text'' AFTER question_text', 
  'SELECT "Column question_type already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if is_required column exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'questions' 
  AND column_name = 'is_required');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN is_required BOOLEAN DEFAULT FALSE AFTER required', 
  'SELECT "Column is_required already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if question_order column exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'questions' 
  AND column_name = 'question_order');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN question_order INT DEFAULT 0 AFTER display_order', 
  'SELECT "Column question_order already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if description column exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = 'llm_survey_db' 
  AND table_name = 'questions' 
  AND column_name = 'description');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN description TEXT AFTER question_order', 
  'SELECT "Column description already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;