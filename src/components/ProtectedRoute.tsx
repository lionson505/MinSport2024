import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/rbac';

interface ProtectedRouteProps {
  moduleName: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ moduleName, children }) => {
  if (!hasPermission(moduleName, 'read')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 