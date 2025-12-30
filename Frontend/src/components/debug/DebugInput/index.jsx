import React from 'react';
import styles from './DebugInput.module.scss';

const DebugInput = ({ value, onChange, placeholder, ...props }) => {
  const handleChange = (e) => {
    console.log('DebugInput onChange triggered:', e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyPress = (e) => {
    console.log('DebugInput keypress:', e.key, e.target.value);
  };

  const handleFocus = () => {
    console.log('DebugInput focused');
  };

  const handleBlur = () => {
    console.log('DebugInput blurred');
  };

  return (
    <input
      type="text"
      className={styles.debugInput}
      value={value || ''}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      autoComplete="off"
      {...props}
    />
  );
};

export default DebugInput;