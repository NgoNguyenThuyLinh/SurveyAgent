import React from 'react';
import styles from './Checkbox.module.scss';

const Checkbox = ({ label, checked, onChange, disabled = false, ...props }) => {
  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {label && <label className={styles.label}>{label}</label>}
    </div>
  );
};

export default Checkbox;
