import React from 'react';
import styles from './Badge.module.scss';

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  );
};

export default Badge;
