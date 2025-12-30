import React from 'react';
import styles from './Modal.module.scss';

const Modal = ({ isOpen, title, children, onClose, actions, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles[size]}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {actions && <div className={styles.footer}>{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
