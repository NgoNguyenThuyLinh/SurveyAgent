const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ChatConversation = sequelize.define('ChatConversation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'New Chat'
        },
        status: {
            type: DataTypes.ENUM('active', 'archived', 'deleted'),
            allowNull: false,
            defaultValue: 'active'
        },
        last_message_at: {
            type: DataTypes.DATE,
            allowNull: true
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
        tableName: 'chat_conversations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['status'] },
            { fields: ['created_at'] }
        ]
    });

    ChatConversation.associate = (models) => {
        ChatConversation.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        ChatConversation.hasMany(models.ChatMessage, {
            foreignKey: 'conversation_id',
            as: 'messages'
        });
    };

    return ChatConversation;
};