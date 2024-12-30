import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { hasPermission } from '../utils/rbac';

export const PermissionButton = ({
  moduleName,
  action,
  children,
  fallback = null,
  showTooltip = false,
  ...buttonProps
}) => {
  const hasAccess = hasPermission(moduleName, action);

  if (!hasAccess) {
    if (showTooltip) {
      return (
        <Tooltip title="You don't have permission for this action">
          <span>{fallback}</span>
        </Tooltip>
      );
    }
    return fallback;
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
}; 