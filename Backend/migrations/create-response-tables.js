// Sequelize migration for creating survey response tables
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // survey_responses
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        survey_id INT NOT NULL,
        respondent_name VARCHAR(255),
        respondent_email VARCHAR(255),
        session_token VARCHAR(255),
        is_completed BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      )
    `);

    // response_answers
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS response_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        response_id INT NOT NULL,
        question_id INT NOT NULL,
        answer_text TEXT,
        selected_option_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS response_answers');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS survey_responses');
  }
};