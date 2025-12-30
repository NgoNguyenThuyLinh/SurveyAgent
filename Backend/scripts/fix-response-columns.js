require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'llm_survey_db';

  console.log(`Connecting to MySQL ${user}@${host}:${port} / ${database}`);
  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database });

    // Check existing columns
    const [rows] = await conn.execute("SHOW COLUMNS FROM `survey_responses`");
    const existingCols = rows.map(r => r.Field);
    console.log('Existing columns:', existingCols);

    const columnsToAdd = [
      { name: 'started_at', sql: "ALTER TABLE `survey_responses` ADD COLUMN `started_at` DATETIME NULL" },
      { name: 'completed_at', sql: "ALTER TABLE `survey_responses` ADD COLUMN `completed_at` DATETIME NULL" },
      { name: 'abandoned_at', sql: "ALTER TABLE `survey_responses` ADD COLUMN `abandoned_at` DATETIME NULL" },
      { name: 'last_saved_at', sql: "ALTER TABLE `survey_responses` ADD COLUMN `last_saved_at` DATETIME NULL" },
      { name: 'response_data', sql: "ALTER TABLE `survey_responses` ADD COLUMN `response_data` JSON NULL" },
    ];

    for (const col of columnsToAdd) {
      if (!existingCols.includes(col.name)) {
        console.log(`Adding column ${col.name}...`);
        await conn.execute(col.sql);
        console.log(` Column ${col.name} added`);
      } else {
        console.log(`  Column ${col.name} already exists`);
      }
    }

    console.log(' All columns synchronized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
