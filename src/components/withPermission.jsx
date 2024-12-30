import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/rbac';

export const withPermission = (WrappedComponent, moduleName) => {
  return function WithPermissionComponent(props) {
    if (!hasPermission(moduleName, 'read')) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}; 