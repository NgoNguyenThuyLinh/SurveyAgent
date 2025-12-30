// src/components/common/Loader/Loader.jsx
import React from 'react';
import styles from './Loader.module.scss';

const Loader = ({ 
  size = 'medium', // small, medium, large
  fullScreen = false,
  message 
}) => {
  const content = (
    <div className={styles.loaderContent}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
