import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/rbac';

export const ProtectedRoute = ({ moduleName, children }) => {
  const token = localStorage.getItem('token');
  
  // First fallback: No token -> redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Second fallback: No permission -> redirect to unauthorized
  if (!hasPermission(moduleName, 'read')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed -> render children
  return children;
}; 