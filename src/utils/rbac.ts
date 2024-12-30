import { jwtDecode } from 'jwt-decode';

interface Permission {
  id: number;
  groupId: number;
  moduleId: number;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  module: {
    id: number;
    name: string;
  };
}

interface DecodedToken {
  userId: number;
  userGroupId: number;
  permissions: Permission[];
}

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
} as const;

export type ModuleName = typeof MODULES[keyof typeof MODULES];

export const getPermissions = (): Permission[] => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  try {
    const decoded = jwtDecode(token) as DecodedToken;
    return decoded.permissions || [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

export const hasPermission = (moduleName: ModuleName, action: 'read' | 'create' | 'update' | 'delete'): boolean => {
  const permissions = getPermissions();
  const modulePermission = permissions.find(p => p.module.name === moduleName);
  
  if (!modulePermission) return false;
  
  switch (action) {
    case 'read':
      return modulePermission.canRead;
    case 'create':
      return modulePermission.canCreate;
    case 'update':
      return modulePermission.canUpdate;
    case 'delete':
      return modulePermission.canDelete;
    default:
      return false;
  }
}; 