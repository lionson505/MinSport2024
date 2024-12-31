import { usePermissions } from '../utils/permissionUtils.js';
import { MODULE_IDS } from '../constants/modules';

export const usePermissionLogger = (moduleName) => {
    const { checkPermission } = usePermissions();

    const logPermissions = () => {
        const moduleId = MODULE_IDS[moduleName.toUpperCase()];
        if (!moduleId) {
            console.error(`No module ID found for ${moduleName}`);
            return;
        }

        const permissions = {
            canCreate: checkPermission(moduleId, 'create'),
            canRead: checkPermission(moduleId, 'read'),
            canUpdate: checkPermission(moduleId, 'update'),
            canDelete: checkPermission(moduleId, 'delete')
        };

        console.log(`Permissions for ${moduleName}:`, permissions);
        return permissions;
    };

    return logPermissions;
};
