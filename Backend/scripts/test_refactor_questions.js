require('dotenv').config();
const { User, SurveyTemplate, Question, QuestionType } = require('./src/models');
const { QUESTION_TYPES } = require('./src/constants/questionTypes');
const questionService = require('./src/modules/questions/service/question.service');
const templateService = require('./src/modules/templates/service/template.service');

async function verify() {
    console.log(' Verifying Question Refactor...');

    try {
        // 1. Mock Data
        const mockUser = await User.findOne(); // Use existing user
        if (!mockUser) throw new Error('No user found');

        console.log(` Using user: ${mockUser.id}`);

        // 2. Create Template
        const template = await SurveyTemplate.create({
            title: 'Test Refactor Template',
            created_by: mockUser.id,
            status: 'draft'
        });
        console.log(` Created Template: ${template.id}`);

        // 3. Test Type Validation (Add Question)
        console.log(' Testing Add Question with Valid Type...');
        const q1 = await templateService.addQuestion(template.id, {
            question_text: 'Valid Question',
            question_type_id: QUESTION_TYPES.MULTIPLE_CHOICE // 2
        }, mockUser);
        const createdQ = q1.Questions ? q1.Questions[q1.Questions.length - 1] : (await Question.findOne({ where: { template_id: template.id }, order: [['id', 'DESC']] }));

        console.log(` Added Question ID: ${createdQ.id} (Type: ${createdQ.question_type_id})`);

        // 4. Test Invalid Type
        console.log(' Testing Add Question with INVALID Type...');
        try {
            await templateService.addQuestion(template.id, {
                question_text: 'Invalid Question',
                question_type_id: 999
            }, mockUser);
            console.error(' FAILED: Should have rejected invalid type');
        } catch (e) {
            console.log(` SUCCESS: Rejected invalid type (${e.message})`);
        }

        // 5. Test Question Service Update
        console.log(` Testing Update Question ID: ${createdQ.id}...`);

        const updatedQ = await questionService.updateQuestion(createdQ.id, {
            label: 'Updated Label',
            question_type_id: QUESTION_TYPES.SINGLE_CHOICE // Change to 1
        }, mockUser);

        if (updatedQ.question_type_id === QUESTION_TYPES.SINGLE_CHOICE) {
            console.log(` SUCCESS: Updated type to ${updatedQ.question_type_id}`);
        } else {
            console.error(` FAILED: Type invalid ${updatedQ.question_type_id}`);
        }

        // Cleanup
        await Question.destroy({ where: { template_id: template.id } });
        await SurveyTemplate.destroy({ where: { id: template.id } });

    } catch (err) {
        console.error(' Error:', err);
    }
    process.exit(0);
}

verify();
