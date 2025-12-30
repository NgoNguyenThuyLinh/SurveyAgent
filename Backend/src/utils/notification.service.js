// src/utils/notification.service.js
// Notification service for tracking user notifications
const { Notification } = require('../models');
const logger = require('./logger');

class NotificationService {
  /**
   * Emit notification via Socket.IO if available
   */
  static emitNotificationToUser(io, userId, notification) {
    if (!io) return; // Socket.IO not available

    try {
      io.to(`user:${userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.message,
        data: notification.data,
        created_at: notification.created_at,
        is_read: notification.is_read
      });
      logger.debug(`[NotificationService] Real-time notification emitted to user ${userId}`);
    } catch (error) {
      logger.error('[NotificationService] Error emitting real-time notification:', error.message);
    }
  }

  /**
   * Create notification for workspace invitation
   */
  async notifyWorkspaceInvitation(userId, workspaceId, inviterId, message, token, io = null) {
    try {
      logger.info(`[NotificationService] Creating invitation notification - token: ${token ? 'present' : 'missing'}`);
      const notification = await Notification.create({
        user_id: userId,
        type: 'workspace_invitation',
        title: 'Workspace Invitation',
        message: message || 'You have been invited to join a workspace',
        // Use new field names
        related_workspace_id: workspaceId,
        actor_id: inviterId,
        // Keep legacy fields for backward compatibility
        related_id: workspaceId,
        related_type: 'workspace',
        is_read: false,
        // Store token in both metadata and data for compatibility
        metadata: token ? { token } : null,
        data: token ? { token } : null,
        // Add action URL for direct navigation
        action_url: token ? `/workspace/invitation/${token}/accept` : null,
        category: 'workspace',
        priority: 'high'
      });

      logger.info(`[NotificationService] Created notification for user ${userId}: workspace_id=${workspaceId}, token=${token ? 'present' : 'missing'}`);
      
      // Emit via Socket.IO
      NotificationService.emitNotificationToUser(io, userId, notification);
      
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Error creating workspace invitation notification:', error.message);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Create notification for survey response
   */
  async notifySurveyResponse(surveyCreatorId, surveyId, responseCount, message, io = null) {
    try {
      const notification = await Notification.create({
        user_id: surveyCreatorId,
        type: 'survey_response',
        title: 'New Survey Response',
        message: message || `You have received ${responseCount} new response(s)`,
        related_id: surveyId,
        related_type: 'survey',
        is_read: false
      });

      logger.info(`[NotificationService] Created response notification for survey ${surveyId}`);
      
      // Emit via Socket.IO
      NotificationService.emitNotificationToUser(io, surveyCreatorId, notification);
      
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Error creating survey response notification:', error.message);
    }
  }

  /**
   * Create notification for member added to workspace
   */
  async notifyMemberAdded(userId, workspaceId, workspaceName, addedByName, io = null) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        type: 'workspace_member_added',
        title: 'Added to Workspace',
        message: `${addedByName} added you to "${workspaceName}"`,
        related_id: workspaceId,
        related_type: 'workspace',
        is_read: false
      });

      logger.info(`[NotificationService] Created member added notification for user ${userId}`);
      
      // Emit via Socket.IO
      NotificationService.emitNotificationToUser(io, userId, notification);
      
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Error creating member added notification:', error.message);
    }
  }

  /**
   * Get unread notifications for user
   */
  async getUnreadNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: userId, is_read: false },
        order: [['created_at', 'DESC']],
        limit
      });

      return notifications;
    } catch (error) {
      logger.error('[NotificationService] Error fetching unread notifications:', error.message);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findByPk(notificationId);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.user_id !== userId) {
        throw new Error('Unauthorized: cannot mark other user\'s notification');
      }

      notification.is_read = true;
      await notification.save();

      logger.info(`[NotificationService] Marked notification ${notificationId} as read`);
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Error marking notification as read:', error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
      );

      logger.info(`[NotificationService] Marked all notifications as read for user ${userId}`);
    } catch (error) {
      logger.error('[NotificationService] Error marking all as read:', error.message);
    }
  }
}

module.exports = new NotificationService();
