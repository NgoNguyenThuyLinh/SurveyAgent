// src/utils/localStorage.js - Safe localStorage utilities
export const safeLocalStorage = {
  /**
   * Safely get and parse JSON from localStorage
   */
  getJSON(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing localStorage item "${key}":`, error);
      localStorage.removeItem(key); // Clear corrupted data
      return defaultValue;
    }
  },

  /**
   * Safely set JSON to localStorage
   */
  setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
      return false;
    }
  },

  /**
   * Safely get string from localStorage
   */
  getString(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return (item && item !== 'undefined') ? item : defaultValue;
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Safely remove item from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage data safely
   */
  clearAll() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export default safeLocalStorage;