import styles from './Input.module.scss';

const Input = ({ className, type = 'text', placeholder, value, onChange, ...props }) => {
  return (
    <input
      type={type}
      className={`${styles.input} ${className || ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default Input;