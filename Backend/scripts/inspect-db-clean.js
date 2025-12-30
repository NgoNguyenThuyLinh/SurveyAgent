require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../src/config/database');

async function run() {
    const result = { success: false, tables: [], schemas: {}, error: null };
    try {
        // wait a bit for connection
        await new Promise(r => setTimeout(r, 1000));

        // 1. List Tables
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        result.tables = tableNames;

        // 2. Describe relevant tables
        const targetTables = ['workspaces', 'workspace_members', 'users'];

        for (const tableName of targetTables) {
            // Case insensitive check
            const found = tableNames.find(t => t.toLowerCase() === tableName.toLowerCase());
            if (found) {
                const [columns] = await sequelize.query(`DESCRIBE ${found}`);
                result.schemas[found] = columns;
            }
        }
        result.success = true;

    } catch (e) {
        result.error = e.message;
    } finally {
        await sequelize.close();
        fs.writeFileSync(path.join(__dirname, '..', 'db_schema.json'), JSON.stringify(result, null, 2));
        // force exit because logger might keep handles open
        process.exit(0);
    }
}
run();
