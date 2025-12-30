const { sequelize } = require('../src/models');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection: OK');

        // 1. List Tables
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables Found:', tableNames);

        // 2. Check specific tables existence
        const wsExists = tableNames.find(t => t.toLowerCase() === 'workspaces');
        const memberExists = tableNames.find(t => t.toLowerCase() === 'workspace_members');

        console.log(`- 'workspaces' table: ${wsExists ? 'EXISTS' : 'MISSING'}`);
        console.log(`- 'workspace_members' table: ${memberExists ? 'EXISTS' : 'MISSING'}`);

        if (memberExists) {
            // 3. Describe Table
            const [columns] = await sequelize.query(`DESCRIBE ${memberExists}`);
            console.log(`Schema for ${memberExists}:`);
            columns.forEach(c => console.log(` - ${c.Field} (${c.Type}) Null:${c.Null} Key:${c.Key} Default:${c.Default}`));
        }

        // 4. Test Raw Insert (if tables verify)
        if (wsExists && memberExists) {
            // Try raw insert to see exact error (bypassing model validation for a moment to check DB constraints)
            // ... actually let's just log that we are ready to debug logic if tables exist.
        }

    } catch (e) {
        console.error('DB Inspection Failed:', e.message);
    } finally {
        await sequelize.close();
    }
}
run();
