-- Migration: Create survey_collectors table
-- Description: Add collectors for public survey links and anonymous responses

USE NCKH;

-- Create survey_collectors table
CREATE TABLE IF NOT EXISTS survey_collectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    collector_type ENUM('web_link', 'qr_code', 'email', 'embedded') DEFAULT 'web_link',
    token VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_responses BOOLEAN DEFAULT FALSE,
    response_count INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_survey_id (survey_id),
    INDEX idx_token (token)
);
