import React from 'react';
import { hasPermission } from '../utils/rbac';

interface PermissionMenuItemProps {
  moduleName: string;
  children: React.ReactNode;
}

export const PermissionMenuItem: React.FC<PermissionMenuItemProps> = ({ moduleName, children }) => {
  if (!hasPermission(moduleName, 'read')) {
    return null;
  }

  return <>{children}</>;
}; 