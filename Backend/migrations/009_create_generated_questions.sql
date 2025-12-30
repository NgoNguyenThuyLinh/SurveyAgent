-- Migration: Create generated_questions table
-- File: 009_create_generated_questions.sql
-- Description: Store AI generated questions for reuse and tracking

CREATE TABLE IF NOT EXISTS `generated_questions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `question_text` text NOT NULL,
    `question_type` enum('text','multiple_choice','yes_no','rating','checkbox','dropdown','likert_scale') NOT NULL DEFAULT 'text',
    `options` json NULL COMMENT 'Question options for choice-based questions',
    `keyword` varchar(255) NULL COMMENT 'Keyword used for generation',
    `category` varchar(100) NULL COMMENT 'Category used for generation',
    `source_model` varchar(100) NOT NULL DEFAULT 'trained_model' COMMENT 'AI model used for generation',
    `generated_by` int NOT NULL,
    `is_used` boolean DEFAULT FALSE COMMENT 'Whether this question has been used in a survey',
    `use_count` int DEFAULT 0 COMMENT 'Number of times this question has been used',
    `quality_score` decimal(3,2) NULL COMMENT 'Quality score if available',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_generated_questions_keyword` (`keyword`),
    INDEX `idx_generated_questions_category` (`category`),
    INDEX `idx_generated_questions_generated_by` (`generated_by`),
    INDEX `idx_generated_questions_type` (`question_type`),
    INDEX `idx_generated_questions_created_at` (`created_at`),
    CONSTRAINT `fk_generated_questions_generated_by` 
        FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;