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

    const [rows] = await conn.execute("SHOW COLUMNS FROM `surveys` LIKE 'deleted_by'");
    if (rows.length > 0) {
      console.log('Column `deleted_by` already exists on `surveys`. Nothing to do.');
      process.exit(0);
    }

    console.log('Adding column `deleted_by` to `surveys`...');
    await conn.execute("ALTER TABLE `surveys` ADD COLUMN `deleted_by` INT NULL AFTER `deleted_at`");
    console.log(' Column `deleted_by` added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error while checking/adding deleted_by column:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
