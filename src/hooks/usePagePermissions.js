import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '../utils/rbac';

export const usePagePermissions = (moduleName) => {
  const navigate = useNavigate();

  const permissions = {
    canRead: hasPermission(moduleName, 'read'),
    canCreate: hasPermission(moduleName, 'create'),
    canUpdate: hasPermission(moduleName, 'update'),
    canDelete: hasPermission(moduleName, 'delete')
  };

  useEffect(() => {
    if (!permissions.canRead) {
      navigate('/unauthorized');
    }
  }, [permissions.canRead, navigate]);

  return permissions;
}; 