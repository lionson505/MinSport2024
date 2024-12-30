import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission, ModuleName } from '../utils/rbac';

export const withPermission = (WrappedComponent: React.ComponentType, moduleName: ModuleName) => {
  return function WithPermissionComponent(props: any) {
    if (!hasPermission(moduleName, 'read')) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}; 