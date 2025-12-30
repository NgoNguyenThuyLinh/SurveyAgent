// Script to update Likert scale labels to English
// Set environment variables for database connection
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3307';
process.env.DB_NAME = 'llm_survey_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'rootpassword';

const sequelize = require('../src/config/database');

async function updateLikertLabels() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log(' Connected successfully');

    console.log('\nUpdating Likert scale labels to English...');
    
    const [results] = await sequelize.query(`
      UPDATE question_options qo
      INNER JOIN questions q ON qo.question_id = q.id
      SET qo.option_text = CASE qo.display_order
          WHEN 1 THEN '1 - Strongly disagree'
          WHEN 2 THEN '2 - Disagree'
          WHEN 3 THEN '3 - Neutral'
          WHEN 4 THEN '4 - Agree'
          WHEN 5 THEN '5 - Strongly agree'
          ELSE qo.option_text
      END
      WHERE q.question_type_id = 3
        AND qo.display_order BETWEEN 1 AND 5;
    `);

    console.log(` Updated ${results.affectedRows} rows`);

    // Verify the update
    console.log('\nVerifying updated labels:');
    const [options] = await sequelize.query(`
      SELECT 
          q.id AS question_id,
          q.question_text,
          qo.option_text,
          qo.display_order
      FROM questions q
      INNER JOIN question_options qo ON q.id = qo.question_id
      WHERE q.question_type_id = 3
      ORDER BY q.id, qo.display_order
      LIMIT 10;
    `);

    console.table(options);

    console.log('\n Likert labels updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Error updating labels:', error.message);
    process.exit(1);
  }
}

updateLikertLabels();
