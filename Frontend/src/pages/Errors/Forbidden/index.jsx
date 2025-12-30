import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Forbidden.module.scss';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.forbiddenContainer}>
      <div className={styles.content}>
        <div className={styles.statusCode}>403</div>
        <h1 className={styles.title}>Forbidden</h1>
        <p className={styles.message}>
          You do not have permission to access this resource.
        </p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
