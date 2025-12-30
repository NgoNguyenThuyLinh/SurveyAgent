const express = require('express');
const { authenticate } = require('../../auth-rbac/middleware/auth.middleware');
const chatController = require('../controller/chat.controller');

const router = express.Router();

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id', chatController.getConversation);
router.put('/conversations/:id', chatController.updateConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.put('/messages/:id', chatController.updateMessage);
router.delete('/messages/:id', chatController.deleteMessage);

router.post('/ai/super-dev', chatController.chatWithSuperDev);
router.post('/ai/gemini', chatController.chatWithGemini);
router.post('/ai/auto', chatController.chatWithAuto);

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = router;
