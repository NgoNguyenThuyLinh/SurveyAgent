
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, SurveyResponse, Survey, User } = require('../src/models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Find existing survey or create one
        let survey = await Survey.findOne();
        if (!survey) {
            survey = await Survey.create({
                title: 'Debug Survey',
                created_by: 1, // Assume user 1 exists, or create
                status: 'active'
            });
        }
        console.log('Using Survey ID:', survey.id);

        console.log('Case 1: Anonymous');
        await SurveyResponse.create({
            survey_id: survey.id,
            status: 'started',
            is_anonymous: true,
            respondent_id: null,
            respondent_email: null,
            time_taken: 50
        });

        console.log('Case 2: User Linked');
        await SurveyResponse.create({
            survey_id: survey.id,
            status: 'completed',
            is_anonymous: false,
            respondent_id: 1, // Assume user 1 exists, otherwise this throws DB error not Validation if FK enforced
            respondent_email: null,
            time_taken: 100
        });

        console.log('Case 3: Email Only');
        await SurveyResponse.create({
            survey_id: survey.id,
            status: 'started',
            is_anonymous: false,
            respondent_id: null,
            respondent_email: 'test@example.com',
            time_taken: 20
        });

        console.log('All cases passed!');
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.name);
        if (e.errors) {
            e.errors.forEach(err => {
                console.log(`Field: ${err.path}`);
                console.log(`Message: ${err.message}`);
                console.log(`Value: ${err.value}`);
            });
        } else {
            console.log(e);
        }
        process.exit(1);
    }
}

debug();
