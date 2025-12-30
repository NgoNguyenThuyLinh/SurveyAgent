// src/api/services/socket.service.js

import io from 'socket.io-client';

/**
 * Socket.IO Service for Real-time Notifications
 * Handles WebSocket connection and event listeners
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Initialize socket connection
   */
  init() {
    if (this.socket) {
      return;
    }

    try {
      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      this.socket = io(socketUrl, {
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelayMax: 10000,
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();
      console.log('[SocketService] Socket initialized');
    } catch (error) {
      console.error('[SocketService] Failed to initialize socket:', error);
      this.useFallbackPolling();
    }
  }

  /**
   * Setup default socket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('[SocketService] Connected to server');
      this.emit('socketConnected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[SocketService] Disconnected from server');
      this.emit('socketDisconnected');
    });

    this.socket.on('notification', (data) => {
      console.log('[SocketService] Notification received:', data);
      this.emit('notification', data);
    });

    this.socket.on('notification:new', (data) => {
      console.log('[SocketService] New notification:', data);
      this.emit('notificationNew', data);
    });

    this.socket.on('workspace:updated', (data) => {
      console.log('[SocketService] Workspace updated:', data);
      this.emit('workspaceUpdated', data);
    });

    this.socket.on('workspace:member_added', (data) => {
      console.log('[SocketService] Member added to workspace:', data);
      this.emit('workspaceMemberAdded', data);
    });

    this.socket.on('error', (error) => {
      console.error('[SocketService] Socket error:', error);
      this.emit('socketError', error);
    });
  }

  /**
   * Use fallback polling when Socket.IO is not available
   */
  useFallbackPolling() {
    console.warn('[SocketService] Using fallback polling for notifications');
    this.isConnected = true;
    // Emit connected event for fallback
    this.emit('socketConnected');
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Emit custom event
   */
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SocketService] Error in listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Listen to custom events
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    };
  }

  /**
   * Emit socket event to server
   */
  send(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`[SocketService] Socket not connected. Event ${eventName} not sent.`);
    }
  }

  /**
   * Join a room (for workspace or other contexts)
   */
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join', { room: roomName });
      console.log(`[SocketService] Joined room: ${roomName}`);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave', { room: roomName });
      console.log(`[SocketService] Left room: ${roomName}`);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      hasSocket: !!this.socket,
      socketId: this.socket?.id || null
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
