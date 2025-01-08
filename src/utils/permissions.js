import { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import {secureStorage} from './crypto.js';

// Add module constants to match your API
// export const MODULE_IDS = {
//   DASHBOARD: 5,
//   NATIONAL_TEAMS: 6,
//   FEDERATIONS: 7,
//   SPORTS_PROFESSIONALS: 8,
//   TRAININGS: 9,
//   ISONGA_PROGRAMS: 10,
//   ACADEMIES: 11,
//   INFRASTRUCTURE: 12,
//   SPORTS_TOURISM: 13,
//   DOCUMENTS: 14,
//   CONTRACTS: 15,
//   APPOINTMENTS: 16,
//   EMPLOYEE: 17,
//   USERS: 18,
//   SPORTS_FOR_ALL: 19
// };

// Update checkPermission to use numeric IDs
export const checkPermission = (userPermissions, moduleId, action) => {
  // If no permissions at all, deny access
  if (!userPermissions) return false;
  
  // Admin bypass
  if (userPermissions === 'admin' || secureStorage.getItem('userRole') === 'admin') {
    return true;
  }

  // Convert string moduleId to number if needed
  const numericModuleId = Number(moduleId);
  
  // Find the specific module permission
  const modulePermission = userPermissions?.find(p => p.moduleId === numericModuleId);
  if (!modulePermission) return false;

  // Check specific action permission
  switch (action) {
    case 'read': return !!modulePermission.canRead;
    case 'create': return !!modulePermission.canCreate;
    case 'update': return !!modulePermission.canUpdate;
    case 'delete': return !!modulePermission.canDelete;
    default: return false;
  }
};

// Custom hook to manage permissions
export const usePermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userRole = await secureStorage.getItem('userRole');
        
        // If no role (guest), return empty permissions
        if (!userRole) {
          setPermissions([]);
          setIsLoading(false);
          return;
        }

        // Handle admin
        if (userRole === 'admin') {
          setPermissions('admin');
          return;
        }

        // Fetch group details which includes permissions
        const groupResponse = await axiosInstance.get(`/groups/${userRole}`);
        setPermissions(groupResponse.data.permissions || []);

        // Fetch available modules
        const modulesResponse = await axiosInstance.get('/modules');
        setModules(modulesResponse.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // On error, set empty permissions to prevent access
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, modules, isLoading };
}; 