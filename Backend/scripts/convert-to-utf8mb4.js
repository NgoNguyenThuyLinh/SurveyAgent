// Script to convert database and all tables to utf8mb4
// Purpose: Fix UTF-8 encoding issues (mojibake)
// Set environment variables for database connection
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3307';
process.env.DB_NAME = 'llm_survey_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'rootpassword';

const sequelize = require('../src/config/database');

async function convertToUtf8mb4() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log(' Connected successfully\n');

    console.log('STEP 1: Converting database to utf8mb4...');
    await sequelize.query(`
      ALTER DATABASE llm_survey_db
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
    `);
    console.log(' Database converted\n');

    console.log('STEP 2: Converting tables to utf8mb4...');
    
    const tables = [
      'users',
      'roles',
      'survey_templates',
      'surveys',
      'question_types',
      'questions',
      'question_options',
      'survey_responses',
      'answers',
      'collectors'
    ];

    for (const table of tables) {
      try {
        console.log(`  Converting ${table}...`);
        await sequelize.query(`
          ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        console.log(`   ${table} converted`);
      } catch (error) {
        console.error(`    ${table} - ${error.message}`);
      }
    }

    console.log('\nSTEP 3: Verifying conversion...');
    const [results] = await sequelize.query(`
      SELECT 
          TABLE_NAME,
          TABLE_COLLATION,
          ENGINE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'llm_survey_db'
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME;
    `);

    console.log('\nTable Character Sets:');
    console.table(results);

    // Check column collations
    console.log('\nVerifying text column collations...');
    const [columns] = await sequelize.query(`
      SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CHARACTER_SET_NAME,
          COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'llm_survey_db'
        AND DATA_TYPE IN ('varchar', 'text', 'char', 'mediumtext', 'longtext')
        AND CHARACTER_SET_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME;
    `);

    console.log('\nText Columns:');
    console.table(columns.slice(0, 20)); // Show first 20 columns

    const nonUtf8mb4Columns = columns.filter(c => c.CHARACTER_SET_NAME !== 'utf8mb4');
    if (nonUtf8mb4Columns.length > 0) {
      console.log('\n  WARNING: Found columns not using utf8mb4:');
      console.table(nonUtf8mb4Columns);
    } else {
      console.log('\n All text columns are using utf8mb4!');
    }

    console.log('\n Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Error during migration:', error.message);
    process.exit(1);
  }
}

convertToUtf8mb4();
