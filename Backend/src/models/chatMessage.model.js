const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ChatMessage = sequelize.define('ChatMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chat_conversations',
                key: 'id'
            }
        },
        sender_type: {
            type: DataTypes.ENUM('user', 'ai'),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        api_provider: {
            type: DataTypes.ENUM('super_dev', 'gemini'),
            allowNull: true,
            comment: 'API provider used for AI responses'
        },
        response_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Response time in milliseconds'
        },
        tokens_used: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Number of tokens used for AI response'
        },
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'error'),
            allowNull: false,
            defaultValue: 'sent'
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Additional metadata for the message'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'chat_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        indexes: [
            { fields: ['conversation_id'] },
            { fields: ['sender_type'] },
            { fields: ['created_at'] },
            { fields: ['api_provider'] }
        ]
    });

    ChatMessage.associate = (models) => {
        ChatMessage.belongsTo(models.ChatConversation, {
            foreignKey: 'conversation_id',
            as: 'conversation'
        });
    };

    return ChatMessage;
};