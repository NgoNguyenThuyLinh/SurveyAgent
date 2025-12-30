import styles from './Button.module.scss';

const Button = ({ children, className, loading, disabled, onClick, type = 'button', ...props }) => {
  return (
    <button
      type={type}
      className={`${styles.btn} ${className || ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;