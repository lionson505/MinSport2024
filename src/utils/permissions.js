import { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { secureStorage } from './crypto.js';
import { MODULE_IDS } from '../constants/modules.js';

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
          setIsLoading(false);
          return;
        }

        // Resolve group by numeric ID or by name search
        let groupPermissions = [];
        const parsedId = parseInt(userRole, 10);
        if (!isNaN(parsedId)) {
          // Numeric ID
          const groupResponse = await axiosInstance.get(`/groups/${parsedId}`);
          groupPermissions = groupResponse.data?.permissions || [];
        } else {
          // Search by name (case-insensitive) and take the best match
          const searchResp = await axiosInstance.get(`/groups`, {
            params: { search: userRole, limit: 1, page: 1 }
          });
          const list = Array.isArray(searchResp.data?.data) ? searchResp.data.data : [];
          if (list.length > 0) {
            const found = list[0];
            // If needed, fetch fresh group details by ID to ensure full permissions
            const groupResponse = await axiosInstance.get(`/groups/${found.id}`);
            groupPermissions = groupResponse.data?.permissions || [];
          } else {
            groupPermissions = [];
          }
        }

        setPermissions(groupPermissions);

        // Fetch available modules
        const modulesResponse = await axiosInstance.get('/modules');
        setModules(Array.isArray(modulesResponse.data) ? modulesResponse.data : []);
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

  // Resolve various forms of module identifier to numeric ID
  const resolveModuleId = (moduleId) => {
    if (typeof moduleId === 'number') return moduleId;
    if (typeof moduleId === 'string') {
      const upper = moduleId.toUpperCase();
      if (MODULE_IDS && MODULE_IDS[upper] != null) return MODULE_IDS[upper];
      const asNum = Number(moduleId);
      if (!Number.isNaN(asNum)) return asNum;
    }
    return undefined;
  };

  // Expose hasModuleAccess for consumers like Dashboard.jsx
  const hasModuleAccess = async (moduleId) => {
    try {
      if (permissions === 'admin') return true;
      if (!Array.isArray(permissions)) return false;
      const numericId = resolveModuleId(moduleId);
      if (numericId == null) return false;
      const modulePerm = permissions.find((p) => p && p.moduleId === numericId);
      return Boolean(modulePerm?.canRead);
    } catch (e) {
      console.error('hasModuleAccess error:', e);
      return false;
    }
  };

  return { permissions, modules, isLoading, hasModuleAccess };
};
 