import http from '../http';

class ChatService {
    // Conversation management
    async getConversations(page = 1, limit = 20, status = 'active') {
        try {
            const response = await http.get('/chat/conversations', {
                params: { page, limit, status }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get conversations');
        }
    }

    async createConversation(title = 'New Chat') {
        try {
            const response = await http.post('/chat/conversations', { title });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create conversation');
        }
    }

    async getConversation(conversationId) {
        try {
            const response = await http.get(`/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get conversation');
        }
    }

    async updateConversation(conversationId, updates) {
        try {
            const response = await http.put(`/chat/conversations/${conversationId}`, updates);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update conversation');
        }
    }

    async deleteConversation(conversationId) {
        try {
            const response = await http.delete(`/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete conversation');
        }
    }

    // Message management
    async getMessages(conversationId, page = 1, limit = 50) {
        try {
            const response = await http.get(`/chat/conversations/${conversationId}/messages`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get messages');
        }
    }

    async sendMessage(conversationId, message, apiProvider = 'auto') {
        try {
            const response = await http.post(`/chat/conversations/${conversationId}/messages`, {
                message,
                api_provider: apiProvider
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    }

    async updateMessage(messageId, message) {
        try {
            const response = await http.put(`/chat/messages/${messageId}`, { message });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update message');
        }
    }

    async deleteMessage(messageId) {
        try {
            const response = await http.delete(`/chat/messages/${messageId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete message');
        }
    }

    // Direct AI chat endpoints
    async chatWithSuperDev(message, conversationId = null) {
        try {
            const response = await http.post('/chat/ai/super-dev', {
                message,
                conversation_id: conversationId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to chat with Super Dev');
        }
    }

    async chatWithGemini(message, conversationId = null) {
        try {
            const response = await http.post('/chat/ai/gemini', {
                message,
                conversation_id: conversationId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to chat with Gemini');
        }
    }

    async chatWithAuto(message, conversationId = null) {
        try {
            const response = await http.post('/chat/ai/auto', {
                message,
                conversation_id: conversationId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to chat with AI');
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await http.get('/chat/health');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Chat service unavailable');
        }
    }
}

const chatService = new ChatService();
export default chatService;
