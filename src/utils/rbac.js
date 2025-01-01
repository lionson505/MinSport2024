import {secureStorage} from "./crypto.js";

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

export const fetchPermissions = async (groupId) => {
    try {
        console.log('Fetching Permissions')

        const response = await axiosInstance.get(`/api/permissions/groups/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch permissions');
        console.log('Fetched Permissions' , response.data)
        return await response.json();
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
    }
};

export const getStoredPermissions = async () => {
    try {
        // const perms = localStorage.getItem('permissions');
        const perms =  await secureStorage.getItem('permissions')
        return perms ? JSON.parse(perms) : [];
    } catch (error) {
        console.error('Error getting stored permissions:', error);
        return [];
    }
};

export const storePermissions = async (permissions) => {
    try {
        await secureStorage.setItem('permissions', JSON.stringify(permissions));
        // localStorage.setItem('permissions', JSON.stringify(permissions));
    } catch (error) {
        console.error('Error storing permissions:', error);
    }
};

export const hasPermission = (moduleName, action) => {
    try {
        // Admin check (group ID 1)
        if (localStorage.getItem('groupId') === '1') {
            return true;
        }

        const permissions = getStoredPermissions();
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
        return false;
    }
};

export const initializePermissions = async () => {
    const groupId = localStorage.getItem('groupId');
    if (!groupId) return;

    alert("permissions are being Updated")

    const permissions = await fetchPermissions(groupId);
    if (permissions.length) {
        storePermissions(permissions);

    }
};