const { Notification, User, Survey, Workspace } = require('../../../models');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    actionUrl = null,
    actorId = null,
    relatedSurveyId = null,
    relatedWorkspaceId = null,
    relatedResponseId = null,
    relatedUserId = null,
    priority = 'normal',
    category = 'system',
    metadata = null
  }) {
    try {
      // Create notification in database
      const notification = await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        actor_id: actorId,
        related_survey_id: relatedSurveyId,
        related_workspace_id: relatedWorkspaceId,
        related_response_id: relatedResponseId,
        related_user_id: relatedUserId,
        priority,
        category,
        metadata,
        is_read: false,
        is_archived: false
      });

      // Get actor info if provided
      if (actorId) {
        const actor = await User.findByPk(actorId, {
          attributes: ['id', 'username', 'full_name']
        });

        if (actor) {
          notification.actor_name = actor.full_name || actor.username;
          notification.actor_avatar = actor.avatar;
          await notification.save();
        }
      }

      // Send real-time notification via WebSocket
      await this.sendRealTimeNotification(userId, notification);

      logger.info(`Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send real-time notification via WebSocket
   */
  async sendRealTimeNotification(userId, notification) {
    try {
      // Try to get socket.io instance, but don't crash if not available
      let io;
      try {
        io = require('../../../socket').getIO();
      } catch (err) {
        // Socket module not available, skip real-time notification
        logger.warn('Socket.IO not available, skipping real-time notification');
        return;
      }

      if (!io) {
        logger.warn('Socket.IO not initialized, skipping real-time notification');
        return;
      }

      // Emit to specific user's room
      io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.action_url,
        actor: {
          id: notification.actor_id,
          name: notification.actor_name,
          avatar: notification.actor_avatar
        },
        priority: notification.priority,
        category: notification.category,
        isRead: notification.is_read,
        createdAt: notification.created_at
      });

      logger.info(` Real-time notification sent to user ${userId}`);
    } catch (error) {
      logger.error(` Error sending real-time notification: ${error.message}`);
      // Don't throw - notification is already saved in DB
    }
  }

  /**
   * Batch notify workspace members
   */
  async notifyWorkspaceMembers(workspaceId, notificationData, excludeUserId = null) {
    try {
      const { WorkspaceMember } = require('../../../models');

      const members = await WorkspaceMember.findAll({
        where: {
          workspace_id: workspaceId,
          is_active: true,
          ...(excludeUserId && { user_id: { [Op.ne]: excludeUserId } })
        }
      });

      const promises = members.map(member =>
        this.createNotification({
          ...notificationData,
          userId: member.user_id
        })
      );

      await Promise.all(promises);
      logger.info(` Notified ${members.length} workspace members`);
    } catch (error) {
      logger.error(` Error notifying workspace members: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (!notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date();
        await notification.save();

        // Emit read event to update UI (safe)
        try {
          const io = require('../../../socket').getIO();
          if (io) {
            io.to(`user_${userId}`).emit('notification:read', {
              notificationId: notification.id
            });
          }
        } catch (err) {
          // Socket not available, skip
        }
      }

      return notification;
    } catch (error) {
      logger.error(` Error marking notification as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const [updatedCount] = await Notification.update(
        {
          is_read: true,
          read_at: new Date()
        },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );

      // Emit event to update UI (safe)
      try {
        const io = require('../../../socket').getIO();
        if (io) {
          io.to(`user_${userId}`).emit('notification:all_read');
        }
      } catch (err) {
        // Socket not available, skip
      }

      logger.info(` Marked ${updatedCount} notifications as read for user ${userId}`);
      return { count: updatedCount };
    } catch (error) {
      logger.error(` Error marking all as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.is_archived = true;
      await notification.save();

      return notification;
    } catch (error) {
      logger.error(` Error archiving notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination and filters
   */
  async getUserNotifications(userId, {
    page = 1,
    limit = 20,
    unreadOnly = false,
    category = null,
    includeArchived = false
  }) {
    try {
      const where = {
        user_id: userId,
        ...(includeArchived ? {} : { is_archived: false })
      };

      if (unreadOnly) {
        where.is_read = false;
      }

      if (category) {
        where.category = category;
      }

      const { count, rows } = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [
          ['is_read', 'ASC'], // Unread first
          ['created_at', 'DESC'] // Then by time
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'full_name'],
            required: false
          }
        ]
      });

      const unreadCount = await this.getUnreadCount(userId);

      return {
        notifications: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        },
        unreadCount
      };
    } catch (error) {
      logger.error(` Error getting user notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.count({
        where: {
          user_id: userId,
          is_read: false,
          is_archived: false
        }
      });
    } catch (error) {
      logger.error(` Error getting unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await Notification.destroy({
        where: {
          created_at: {
            [Op.lt]: cutoffDate
          },
          is_read: true,
          is_archived: true
        }
      });

      logger.info(` Deleted ${deletedCount} old notifications`);
      return { count: deletedCount };
    } catch (error) {
      logger.error(` Error deleting old notifications: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new NotificationService();
