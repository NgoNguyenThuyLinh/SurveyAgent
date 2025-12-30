require('dotenv').config();
const { Survey, SurveyResponse, User, SurveyTemplate, Question } = require('./src/models');
const surveyService = require('./src/modules/surveys/service/survey.service');

async function verify() {
    console.log(' Verifying My Response Count Logic...');

    try {
        // 1. Create a Real Mock User in DB to satisfy foreign keys
        const mockUser = await User.create({
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            role: 'user',
            full_name: 'Test User'
        });
        console.log(` Created User: ${mockUser.id}`);

        const template = await SurveyTemplate.create({
            title: `Test Template`,
            created_by: mockUser.id,
            status: 'active'
        });

        // 2. Create Survey with valid dates
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 30);

        const survey = await Survey.create({
            title: `Test Survey`,
            template_id: template.id,
            created_by: mockUser.id,
            status: 'active',
            start_date: now,
            end_date: future,
            access_type: 'public',
            target_audience: 'all_users',
            allow_anonymous: false
        });
        console.log(` Created Survey: ${survey.id}`);

        // MAKE SURE to add SurveyResponses
        await SurveyResponse.create({ survey_id: survey.id, respondent_id: mockUser.id, status: 'completed' });
        await SurveyResponse.create({ survey_id: survey.id, respondent_id: null, status: 'completed' }); // Anonymous/Other
        await SurveyResponse.create({ survey_id: survey.id, respondent_id: mockUser.id, status: 'completed' }); // Mine

        // 3. Test Service
        const result = await surveyService.getAllSurveys({ limit: 10, search: 'Test Survey' }, mockUser);
        const targetSurvey = result.surveys.find(s => s.id === survey.id);

        console.log(' Stats:', {
            total: targetSurvey.responseCount,
            my: targetSurvey.my_response_count
        });

        if (targetSurvey.responseCount === 3 && targetSurvey.my_response_count === 2) {
            console.log(' SUCCESS!');
        } else {
            console.error(' FAILURE!');
        }

        // Cleanup
        await SurveyResponse.destroy({ where: { survey_id: survey.id } });
        await Survey.destroy({ where: { id: survey.id } });
        await SurveyTemplate.destroy({ where: { id: template.id } });
        await User.destroy({ where: { id: mockUser.id } });

    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            console.error(' Validation Error:', err.errors.map(e => e.message));
        } else {
            console.error(' Error:', err);
        }
    }
    process.exit(0);
}

verify();
