import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatInput.module.scss';

const ChatInput = ({ onSendMessage, isSending, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isSending && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={styles.chatInput}>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <div className={styles.inputContainer}>
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={disabled ? "Create a conversation first..." : "Type your message... (Shift+Enter for new line)"}
                        className={styles.textarea}
                        disabled={disabled || isSending}
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending || disabled}
                        className={styles.sendButton}
                        title="Send message"
                    >
                        {isSending ? (
                            <div className={styles.sendingSpinner}>
                                <div className={styles.spinner}></div>
                            </div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        )}
                    </button>
                </div>
                <div className={styles.inputFooter}>
                    <span className={styles.hint}>
                        Press Enter to send, Shift+Enter for new line
                    </span>
                    <span className={styles.characterCount}>
                        {message.length}/1000
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;
