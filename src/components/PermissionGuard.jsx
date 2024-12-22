import { usePermissions } from '../hooks/usePermissions';

export const PermissionGuard = ({ 
  moduleId, 
  action, 
  fallback = null, 
  children 
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission({ moduleId, action })) {
    return fallback;
  }

  return children;
}; 