// Sequelize migration to apply simple schema changes
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
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
      ) ENGINE=InnoDB
    `);

    // Add columns; ignore if already exist
    await queryInterface.sequelize.query('ALTER TABLE surveys ADD COLUMN IF NOT EXISTS share_settings TEXT AFTER status').catch(()=>{});
    await queryInterface.sequelize.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS survey_id INT AFTER template_id').catch(()=>{});
    await queryInterface.sequelize.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type ENUM('text', 'multiple_choice', 'yes_no', 'rating', 'date', 'email') DEFAULT 'text' AFTER question_text`).catch(()=>{});
    await queryInterface.sequelize.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT FALSE AFTER required').catch(()=>{});
    await queryInterface.sequelize.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_order INT DEFAULT 0 AFTER display_order').catch(()=>{});
    await queryInterface.sequelize.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT AFTER question_order').catch(()=>{});
    await queryInterface.sequelize.query('ALTER TABLE questions MODIFY template_id INT NULL').catch(()=>{});
  },

  down: async (queryInterface, Sequelize) => {
    // Best-effort rollback
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS survey_links');
    // Do not drop columns by default to avoid data loss
  }
};