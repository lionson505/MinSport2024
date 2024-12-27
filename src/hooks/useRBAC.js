import { MODULE_IDS, ACTIONS } from '../constants/modules';

export const useRBAC = () => {
    const checkPermission = (moduleId, action) => {
        try {
            // Admin bypass
            if (localStorage.getItem('userRole') === 'admin') return true;

            // Get user permissions
            const accessibleLinks = localStorage.getItem('accessibleLinks');
            if (!accessibleLinks) return false;

            const parsedLinks = JSON.parse(accessibleLinks);
            const module = parsedLinks.find(link => link.moduleId === moduleId);

            if (!module) return false;

            // Check specific action permission
            switch (action) {
                case ACTIONS.CREATE: return module.canCreate;
                case ACTIONS.READ: return module.canRead;
                case ACTIONS.UPDATE: return module.canUpdate;
                case ACTIONS.DELETE: return module.canDelete;
                default: return false;
            }
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    };

    return { checkPermission };
};