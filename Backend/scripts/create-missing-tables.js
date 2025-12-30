// Script to create missing tables in MySQL
require('dotenv').config();
const { sequelize } = require('../src/models');

async function createMissingTables() {
  try {
    console.log(' Creating missing tables...\n');

    // Sync all models to database
    // This will create tables that don't exist
    await sequelize.sync({ alter: false, force: false });

    console.log(' All tables synchronized successfully!');

    // Show all tables in database
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    console.log(`\n Current tables in database (${tables.length}):`);
    tables.sort().forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    console.log('\n Database setup complete!');

  } catch (error) {
    console.error(' Error creating tables:', error.message);
    console.error('Details:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
createMissingTables();