import styles from './Select.module.scss';

const Select = ({ children, className, value, onChange, ...props }) => {
  return (
    <select
      className={`${styles.select} ${className || ''}`}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;