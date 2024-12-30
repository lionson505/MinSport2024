import { jwtDecode } from 'jwt-decode';

export const MODULES = {
  DASHBOARD: 'dashboard',
  NATIONAL_TEAMS: 'national-teams',
  FEDERATIONS: 'federations',
  SPORTS_PROFESSIONALS: 'sports-professionals',
  TRAININGS: 'trainings',
  ISONGA_PROGRAMS: 'isonga-programs',
  ACADEMIES: 'academies',
  INFRASTRUCTURE: 'infrastructure',
  SPORTS_TOURISM: 'sports-tourism',
  DOCUMENTS: 'documents',
  CONTRACTS: 'contracts',
  APPOINTMENTS: 'appointments',
  EMPLOYEE: 'employee',
  USERS: 'users',
  SPORTS_FOR_ALL: 'sports-for-all'
};

export const getPermissions = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const decoded = jwtDecode(token);
    
    // Fallback: If no permissions in token, return empty array
    if (!decoded || !decoded.permissions) {
      console.warn('No permissions found in token');
      return [];
    }
    
    return decoded.permissions;
  } catch (error) {
    console.error('Error getting permissions:', error);
    return []; // Fallback: Return empty array on error
  }
};

export const hasPermission = (moduleName, action) => {
  try {
    // Fallback: Admin override (optional)
    if (localStorage.getItem('userRole') === 'admin') {
      return true;
    }

    const permissions = getPermissions();
    const modulePermission = permissions.find(p => p.module?.name === moduleName);
    
    if (!modulePermission) {
      console.warn(`No permissions found for module: ${moduleName}`);
      return false;
    }
    
    switch (action) {
      case 'read':
        return !!modulePermission.canRead;
      case 'create':
        return !!modulePermission.canCreate;
      case 'update':
        return !!modulePermission.canUpdate;
      case 'delete':
        return !!modulePermission.canDelete;
      default:
        console.warn(`Unknown action: ${action}`);
        return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false; // Fallback: Deny access on error
  }
}; 