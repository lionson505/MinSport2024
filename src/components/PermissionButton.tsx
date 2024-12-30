import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { hasPermission } from '../utils/rbac';

interface PermissionButtonProps extends ButtonProps {
  moduleName: string;
  action: 'create' | 'update' | 'delete';
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  moduleName,
  action,
  children,
  ...buttonProps
}) => {
  if (!hasPermission(moduleName, action)) {
    return null;
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
}; 