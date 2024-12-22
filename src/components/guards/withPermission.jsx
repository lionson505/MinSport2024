import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import UnauthorizedAccess from '../UnauthorizedAccess';

export const withPermission = (WrappedComponent, moduleId, action = 'Read') => {
  return function PermissionGuardedComponent(props) {
    const { hasPermission } = usePermissions();
    const { user } = useAuth();

    // Admin bypass - always has access
    if (user?.userGroup?.name === 'admin') {
      return <WrappedComponent {...props} />;
    }

    // Check permission for other users
    if (!hasPermission({ moduleId, action })) {
      return <UnauthorizedAccess />;
    }

    return <WrappedComponent {...props} />;
  };
}; 