import { useAuth } from './useAuth';
import { MODULES } from '../constants/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user?.userGroup?.name) return false;
    
    // Admin has all permissions
    if (user.userGroup.name.toLowerCase() === 'admin') return true;

    // For Users module, check if user has explicit permission
    if (permission.moduleId === MODULES.USERS) {
      return user.userGroup.permissions?.some(p => 
        p.moduleId === MODULES.USERS && 
        (p[`can${permission.action}`] === true)
      ) || false;
    }

    // Check specific permissions for other modules
    return user.userGroup.permissions?.some(p => 
      p.moduleId === permission.moduleId && 
      (p[`can${permission.action}`] === true)
    ) || false;
  };

  const canView = (moduleId) => hasPermission({ moduleId, action: 'Read' });
  const canCreate = (moduleId) => hasPermission({ moduleId, action: 'Create' });
  const canEdit = (moduleId) => hasPermission({ moduleId, action: 'Update' });
  const canDelete = (moduleId) => hasPermission({ moduleId, action: 'Delete' });

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin: user?.userGroup?.name?.toLowerCase() === 'admin'
  };
}; 