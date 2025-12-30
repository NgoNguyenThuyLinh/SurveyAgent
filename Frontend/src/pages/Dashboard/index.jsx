import React from 'react';
import { default as DashboardRouterComponent } from '../../routes/DashboardRouter.jsx';
import styles from './Dashboard.module.scss';

function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <DashboardRouterComponent />
    </div>
  );
}

export default Dashboard;
