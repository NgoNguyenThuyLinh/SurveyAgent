import React, { useState } from 'react';
import styles from './Message.module.scss';

const Message = ({ message, user }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isUser = message.sender_type === 'user';
    const isLoading = message.status === 'sending';
    const hasError = message.status === 'error';
    
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'super_dev':
                return '≡ƒÜÇ';
            case 'gemini':
                return 'Γ£¿';
            default:
                return '≡ƒñû';
        }
    };

    const getProviderColor = (provider) => {
        switch (provider) {
            case 'super_dev':
                return '#ff6b35';
            case 'gemini':
                return '#4285f4';
            default:
                return '#6c757d';
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message.message);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = message.message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}>
            <div className={styles.messageHeader}>
                <div className={styles.sender}>
                    {isUser ? (
                        <>
                            <div className={styles.avatar}>
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className={styles.senderName}>You</span>
                        </>
                    ) : (
                        <>
                            <div 
                                className={styles.aiAvatar}
                                style={{ backgroundColor: getProviderColor(message.api_provider) }}
                            >
                                {getProviderIcon(message.api_provider)}
                            </div>
                            <span className={styles.senderName}>
                                AI Assistant
                                {message.api_provider && (
                                    <span className={styles.provider}>
                                        ({message.api_provider === 'super_dev' ? 'Super Dev' : 'Gemini'})
                                    </span>
                                )}
                            </span>
                        </>
                    )}
                </div>
                <div className={styles.metadata}>
                    {!isUser && message.response_time && (
                        <span className={styles.responseTime}>
                            {message.response_time}ms
                        </span>
                    )}
                    <span className={styles.timestamp}>
                        {formatTime(message.created_at)}
                    </span>
                    {hasError && (
                        <span className={styles.errorBadge} title={message.error_message}>
                            ΓÜá∩╕Å
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.messageContent}>
                {isLoading ? (
                    <div className={styles.loadingMessage}>
                        <div className={styles.typingIndicator}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>Sending...</span>
                    </div>
                ) : (
                    <>
                        <div 
                            className={`${styles.text} ${message.message.length > 500 && !isExpanded ? styles.collapsed : ''}`}
                        >
                            {message.message}
                        </div>
                        
                        {message.message.length > 500 && (
                            <button 
                                className={styles.expandBtn}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}

                        <div className={styles.messageActions}>
                            <button 
                                className={styles.actionBtn}
                                onClick={copyToClipboard}
                                title="Copy message"
                            >
                                ≡ƒôï
                            </button>
                            {!isUser && message.tokens_used && (
                                <span className={styles.tokenCount} title="Tokens used">
                                    {message.tokens_used} tokens
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Message;
