import React, { useState, useRef, useEffect } from 'react';
import AnalyticsService from '../../api/services/analytics.service';
import styles from './AnalysisChat.module.scss';
import { useToast } from '../../contexts/ToastContext';

const SUGGESTED_PROMPTS_WITH_DATA = [
    "How many responses does this survey have?",
    "What is the completion rate?",
    "Which question has the highest drop-off?",
    "Summarize the quality score.",
    "What is the average time per question?",
    "Are there many spam text answers?"
];

const SUGGESTED_PROMPTS_NO_DATA = [
    "What insights should I expect from this survey?",
    "What metrics are most important here?",
    "Suggest hypotheses based on the questions.",
    "What should I look for in the responses?",
    "How can I improve response rates?",
    "What analysis methods would work best?"
];

const AnalysisChat = ({ surveyId, responseCount = 0, surveyTitle = '' }) => {
    const { showToast } = useToast();

    // Contextual initial message
    const getInitialMessage = () => {
        if (responseCount === 0) {
            return `Hello! I'm your analytics assistant. Even though "${surveyTitle}" hasn't received responses yet, I can help you understand what to expect and how to prepare for analysis.`;
        }
        return `Hello! I am your analytics assistant. Ask me anything about "${surveyTitle}"'s data.`;
    };

    const [messages, setMessages] = useState([
        { role: 'system', content: getInitialMessage() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await AnalyticsService.chatWithData(surveyId, text);
            // Handle response structure (response.data.data.answer or response.data.answer depending on service/interceptor)
            // AnalyticsService returns http.post result. Usually http.post returns response.data
            // Backend returns: { success: true, data: { answer } }
            // So http.post returns { success: true, data: { answer } } directly if interceptor extracts data?
            // Or full axios response?
            // Assuming standard simplified response from service helper usually returning data.
            // Let's assume response is the data object from axios.

            const answer = response.data?.answer || response.answer || "I received empty response.";
            const aiMessage = { role: 'system', content: answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = { role: 'system', content: 'Sorry, I encountered an error analyzing the data. Please ensure the AI service is active.' };
            setMessages(prev => [...prev, errorMessage]);
            showToast('AI Service Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
                        <div className={styles.avatar}>
                            {msg.role === 'system' ? '🤖' : '👤'}
                        </div>
                        <div className={styles.content}>
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className={`${styles.message} ${styles.system}`}>
                        <div className={styles.avatar}>🤖</div>
                        <div className={styles.content}>
                            <span className={styles.typing}>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <div className={styles.suggestions}>
                    {(responseCount > 0 ? SUGGESTED_PROMPTS_WITH_DATA : SUGGESTED_PROMPTS_NO_DATA).map((prompt, index) => (
                        <button
                            key={index}
                            className={styles.chip}
                            onClick={() => handleSend(prompt)}
                            disabled={loading || responseCount === 0}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <div className={styles.inputWrapper}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={responseCount === 0 ? "Ask AI about your survey data (available after at least 1 response)" : "Ask about this survey's analytics..."}
                        disabled={loading || responseCount === 0}
                        rows={1}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim() || responseCount === 0}
                        className={styles.sendButton}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisChat;

