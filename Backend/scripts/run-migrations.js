#!/usr/bin/env node
/**
 * Database Migration Runner
 * Executes all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  database: process.env.DB_NAME || 'llm_survey_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function runMigrations() {
  let connection;
  
  try {
    console.log(' Starting database migrations...\n');
    console.log('Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log(' Connected to database\n');

    // Get all migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => {
        // Sort by migration number prefix
        const numA = parseInt(a.split('_')[0]) || 0;
        const numB = parseInt(b.split('_')[0]) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      });

    if (files.length === 0) {
      console.log(' No migration files found');
      return;
    }

    console.log(`Found ${files.length} migration files:\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(` Running: ${file}`);

      try {
        // Split by semicolon to handle multiple statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (error) {
            // Skip if table/column already exists (common case)
            if (error.message.includes('already exists') || 
                error.message.includes('Duplicate column') ||
                error.message.includes('already have a primary key')) {
              console.log(`     Already exists (skipping)`);
              skipCount++;
              break;
            }
            throw error;
          }
        }

        console.log(`    Success\n`);
        successCount++;
      } catch (error) {
        console.error(`    Failed: ${error.message}\n`);
      }
    }

    console.log('\n Migration Summary:');
    console.log(`    Successful: ${successCount}`);
    console.log(`     Skipped: ${skipCount}`);
    console.log(`    Total: ${files.length}\n`);

    if (successCount + skipCount === files.length) {
      console.log(' All migrations completed successfully!\n');
      process.exit(0);
    } else {
      console.log('  Some migrations failed. Check output above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error(' Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations
runMigrations();
