require('dotenv').config();
const { Question, Survey } = require('../src/models');

console.log('Starting debug...');
console.log('Question model:', !!Question);
console.log('Survey model:', !!Survey);

if (Question) {
    console.log('Question.findAll:', typeof Question.findAll);
}
console.log('Done.');
