// src/components/UI/NotificationPanel/index.jsx
import React, { useState, useEffect } from 'react';
import styles from './NotificationPanel.module.scss';
import NotificationService from '../../../../api/services/notification.service';

const NotificationPanel = ({ onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    // Also set up a polling interval to refresh notifications while panel is open
    const pollInterval = setInterval(fetchNotifications, 10000); // Every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await NotificationService.getUnreadNotifications(20);
    if (result.ok) {
      console.log('Unread notifications:', result.notifications);
      setNotifications(result.notifications || []);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await NotificationService.markAsRead(notificationId);
    if (result.ok) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      onNotificationRead?.();
    }
  };


  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate using action_url (not data.action_url)
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleAcceptWorkspaceInvitation = (notificationId, invitationData) => {
    if (invitationData?.token) {
      // Navigate to acceptance page
      window.location.href = `/workspace/invitation/${invitationData.token}/accept`;
      handleMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await NotificationService.markAllAsRead();
    if (result.ok) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onNotificationRead?.();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'workspace_invitation':
        return '✉️';
      case 'workspace_member_added':
        return '👥';
      case 'survey_response':
        return '📝';
      case 'survey_shared':
        return '📤';
      case 'collector_created':
        return '🔗';
      case 'response_completed':
        return '✅';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }

      const now = new Date();
      const diffMinutes = Math.floor((now - date) / 60000);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <div className={styles.notificationPanel}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button
            className={styles.markAllRead}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <span>No notifications yet</span>
          </div>
        ) : (
          <div className={styles.notificationList}>
            {notifications.map((notification, idx) => {
              const debugInfo = {
                id: notification.id,
                type: notification.type,
                has_data: !!notification.data,
                data_keys: notification.data ? Object.keys(notification.data) : 'no data',
                data_token: notification.data?.token,
                title: notification.title,
                message: notification.message,
                is_read: notification.is_read
              };
              console.log(`[${idx}] Notification:`, debugInfo);
              console.log(`[${idx}] Full notification object:`, notification);
              console.log(`[${idx}] Should show Accept button:`, notification.type === 'workspace_invitation' && !!notification.data?.token);
              return (
                <div
                  key={notification.id}
                  className={`${styles.notification} ${!notification.is_read ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: notification.data?.action_url ? 'pointer' : 'default' }}
                >
                  <div className={styles.icon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className={styles.content}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.timestamp}>
                      {formatDate(notification.createdAt || notification.created_at)}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {notification.type === 'workspace_invitation' && notification.data?.token && !notification.is_read && (
                      <button
                        className={styles.acceptButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptWorkspaceInvitation(notification.id, notification.data);
                        }}
                        title="Accept workspace invitation"
                      >
                        Accept
                      </button>
                    )}
                    {!notification.is_read && (
                      <button
                        className={styles.readButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
