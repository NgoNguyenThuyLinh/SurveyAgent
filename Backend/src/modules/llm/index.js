// modules/llm/index.js
const llmRoutes = require('./routes/llm.routes');

module.exports = {
    routes: llmRoutes,
    name: 'llm',
    version: '1.0.0',
    description: 'LLM/AI module for question generation and survey assistance'
};