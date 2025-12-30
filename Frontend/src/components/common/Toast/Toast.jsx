// src/components/common/Toast/Toast.jsx
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import styles from './Toast.module.scss';

const Toast = ({ 
  message, 
  type = 'info', // success, error, warning, info
  duration = 5000,
  onClose 
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
      case 'warning':
        return faExclamationCircle;
      default:
        return faInfoCircle;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <FontAwesomeIcon icon={getIcon()} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
