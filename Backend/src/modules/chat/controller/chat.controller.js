const chatService = require('../service/chat.service');
const logger = require('../../../../src/utils/logger');

class ChatController {
    async getConversations(req, res) {
        try {
            const { page = 1, limit = 20, status = 'active' } = req.query;
            const userId = req.user.id;

            const result = await chatService.getConversations(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            res.json({
                success: true,
                data: result.conversations,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Error getting conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversations',
                error: error.message
            });
        }
    }

    async createConversation(req, res) {
        try {
            const { title } = req.body;
            const userId = req.user.id;

            const conversation = await chatService.createConversation(userId, title);

            res.status(201).json({
                success: true,
                data: conversation
            });
        } catch (error) {
            logger.error('Error creating conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create conversation',
                error: error.message
            });
        }
    }

    async getConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const conversation = await chatService.getConversation(id, userId);

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }

            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            logger.error('Error getting conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversation',
                error: error.message
            });
        }
    }

    async updateConversation(req, res) {
        try {
            const { id } = req.params;
            const { title, status } = req.body;
            const userId = req.user.id;

            const conversation = await chatService.updateConversation(id, userId, { title, status });

            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            logger.error('Error updating conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update conversation',
                error: error.message
            });
        }
    }

    async deleteConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await chatService.deleteConversation(id, userId);

            res.json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete conversation',
                error: error.message
            });
        }
    }

    async getMessages(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const userId = req.user.id;

            const result = await chatService.getMessages(id, userId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: result.messages,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Error getting messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get messages',
                error: error.message
            });
        }
    }

    async sendMessage(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const userId = req.user.id;

            const result = await chatService.sendMessage(id, userId, message);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    }

    async updateMessage(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;

            const result = await chatService.updateMessage(id, message);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error updating message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update message',
                error: error.message
            });
        }
    }

    async deleteMessage(req, res) {
        try {
            const { id } = req.params;

            await chatService.deleteMessage(id);

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete message',
                error: error.message
            });
        }
    }

    async chatWithSuperDev(req, res) {
        try {
            const { conversationId, message } = req.body;
            const userId = req.user.id;

            const result = await chatService.chatWithSuperDev(conversationId, userId, message);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in Super Dev chat:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process chat',
                error: error.message
            });
        }
    }

    async chatWithGemini(req, res) {
        try {
            const { conversationId, message } = req.body;
            const userId = req.user.id;

            const result = await chatService.chatWithGemini(conversationId, userId, message);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in Gemini chat:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process chat',
                error: error.message
            });
        }
    }

    async chatWithAuto(req, res) {
        try {
            const { conversationId, message } = req.body;
            const userId = req.user.id;

            const result = await chatService.chatWithAuto(conversationId, userId, message);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in Auto chat:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process chat',
                error: error.message
            });
        }
    }
}

module.exports = new ChatController();
