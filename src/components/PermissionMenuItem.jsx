import React from 'react';
import { hasPermission } from '../utils/rbac';

export const PermissionMenuItem = ({ moduleName, children }) => {
  if (!hasPermission(moduleName, 'read')) {
    return null;
  }

  return <>{children}</>;
}; 