// src/hooks/useRealTimeNotifications.js

import { useEffect, useRef } from 'react';
import socketService from '../api/services/socket.service';
import NotificationService from '../api/services/notification.service';

/**
 * Hook for managing real-time notifications
 * @param {Function} onNewNotification - Callback when new notification arrives
 * @param {Function} onUnreadCountUpdate - Callback when unread count changes
 */
export const useRealTimeNotifications = (onNewNotification, onUnreadCountUpdate) => {
  const unsubscribeRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Initialize socket connection
    socketService.init();

    // Listen for new notifications
    unsubscribeRef.current = socketService.on('notificationNew', async (notificationData) => {
      console.log('[useRealTimeNotifications] New notification received:', notificationData);

      // Update UI with new notification
      if (onNewNotification) {
        onNewNotification(notificationData);
      }

      // Update unread count
      if (onUnreadCountUpdate) {
        const result = await NotificationService.getUnreadCount();
        if (result.ok) {
          onUnreadCountUpdate(result.count);
        }
      }
    });

    // Fallback: If socket is not available, use polling
    pollIntervalRef.current = setInterval(async () => {
      if (!socketService.isConnected) {
        const result = await NotificationService.getUnreadCount();
        if (result.ok && onUnreadCountUpdate) {
          onUnreadCountUpdate(result.count);
        }
      }
    }, 30000); // Poll every 30 seconds if socket is not connected

    return () => {
      // Cleanup on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [onNewNotification, onUnreadCountUpdate]);
};

export default useRealTimeNotifications;
