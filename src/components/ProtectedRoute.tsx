import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/rbac';

interface ProtectedRouteProps {
  moduleName: string;
  children: React.ReactNode;
}

interface Permissions {
  canread : boolean;
  cancreate: boolean;
  canupdate: boolean;
  candelete: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ moduleName, children }) => {
  if (!hasPermission(moduleName, 'read')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 