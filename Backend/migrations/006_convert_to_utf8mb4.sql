-- Migration: Convert database and all tables to utf8mb4
-- Purpose: Fix UTF-8 encoding issues (mojibake like "Pháº¡m Thá»¥c Anh")
-- Date: 2025-11-10

-- STEP 1: Convert the database itself
ALTER DATABASE llm_survey_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- STEP 2: Convert all tables to utf8mb4
-- This will convert both the table default charset and all text columns

-- User-related tables
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Template and Survey tables
ALTER TABLE survey_templates CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE surveys CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Question-related tables
ALTER TABLE question_types CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE questions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE question_options CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Response tables
ALTER TABLE survey_responses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE answers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Collector table
ALTER TABLE collectors CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Other tables (if any)
-- ALTER TABLE <table_name> CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 3: Verify conversion
SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    ENGINE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'llm_survey_db'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
