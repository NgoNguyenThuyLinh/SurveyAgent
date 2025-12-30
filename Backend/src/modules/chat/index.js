const express = require('express');
const chatRoutes = require('./routes/chat.routes');

const router = express.Router();

router.use('/', chatRoutes);

module.exports = {
    routes: router,
    name: 'chat',
    version: '1.0.0',
    description: 'Chat module with AI integration (Super Dev & Gemini APIs)'
};
