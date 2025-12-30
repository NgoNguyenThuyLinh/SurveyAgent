import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

const DashboardRouter = () => {
  const { state } = useAuth();

  // Redirect to login if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on user role
  switch (state.user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'creator':
      return <Navigate to="/creator/dashboard" replace />;
    case 'user':
      return <Navigate to="/surveys" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;