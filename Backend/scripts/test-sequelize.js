#!/usr/bin/env node
require('dotenv').config();
const { Survey, User, SurveyResponse, sequelize } = require('../src/models');

async function testSequelize() {
    try {
        console.log('\n=== SEQUELIZE TEST ===\n');

        // Test connection
        await sequelize.authenticate();
        console.log(' Connected to database\n');

        // Test Survey.count()
        console.log('Testing Survey.count()...');
        const totalSurveys = await Survey.count();
        console.log(`Result: ${totalSurveys}\n`);

        // Test with raw: true
        console.log('Testing Survey.count({ raw: true })...');
        const totalSurveysRaw = await Survey.count({ raw: true });
        console.log(`Result: ${totalSurveysRaw}\n`);

        // Test Survey.findAll()
        console.log('Testing Survey.findAll()...');
        const allSurveys = await Survey.findAll();
        console.log(`Found ${allSurveys.length} surveys\n`);

        // Test with paranoid: false (in case of soft deletes)
        console.log('Testing Survey.count({ paranoid: false })...');
        const totalWithDeleted = await Survey.count({ paranoid: false });
        console.log(`Result: ${totalWithDeleted}\n`);

        // Check model configuration
        console.log('Model configuration:');
        console.log(`  Table name: ${Survey.tableName}`);
        console.log(`  Paranoid (soft delete): ${Survey.options.paranoid || false}`);
        console.log(`  Default scope: ${JSON.stringify(Survey.options.defaultScope || {})}`);
        console.log(`  Scopes: ${Object.keys(Survey.options.scopes || {}).join(', ') || 'none'}\n`);

        // Test User and SurveyResponse
        console.log('Testing other models:');
        const userCount = await User.count();
        console.log(`  Users: ${userCount}`);
        const responseCount = await SurveyResponse.count();
        console.log(`  Responses: ${responseCount}\n`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testSequelize();
