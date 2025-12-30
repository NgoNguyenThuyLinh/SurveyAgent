import React from 'react';
import styles from './Switch.module.scss';

const Switch = ({ checked, onChange, disabled = false, label, ...props }) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.switch} ${checked ? styles.checked : ''}`}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        type="button"
        {...props}
      >
        <span className={styles.slider} />
      </button>
      {label && <label className={styles.label}>{label}</label>}
    </div>
  );
};

export default Switch;
