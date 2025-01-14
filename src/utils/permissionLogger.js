import { usePermissions } from './permissionUtils';
import { MODULE_IDS } from '../constants/modules';

export const usePermissionLogger = (moduleName) => {
    const { checkPermission } = usePermissions();

    const logPermissions = async () => {
        const moduleId = await MODULE_IDS[moduleName.toUpperCase()];
        if (!moduleId) {
            await console.error(`No module ID found for ${moduleName}`);
            return null;
        }

        const permissions = {
            canCreate: await checkPermission(moduleId, 'create'),
            canRead: await checkPermission(moduleId, 'read'),
            canUpdate: await checkPermission(moduleId, 'update'),
            canDelete: await checkPermission(moduleId, 'delete')
        };

        // console.log(`Permissions for ${moduleName}:`, permissions);
        return permissions;
    };

    return logPermissions;
};

// import { usePermissions } from '../utils/permissionUtils.js';
// import { MODULE_IDS } from '../constants/modules';
//
// export const usePermissionLogger = (moduleName) => {
//     const { checkPermission } = usePermissions();
//
//     const logPermissions = async () => {
//         const moduleId = MODULE_IDS[moduleName.toUpperCase()];
//         if (!moduleId) {
//             console.error(`No module ID found for ${moduleName}`);
//             return null;
//         }
//
//         const permissions = {
//             canCreate: await checkPermission(moduleId, 'create'),
//             canRead: await checkPermission(moduleId, 'read'),
//             canUpdate: await checkPermission(moduleId, 'update'),
//             canDelete: await checkPermission(moduleId, 'delete')
//         };
//
//         console.log(`Permissions for ${moduleName}:`, permissions);
//         return permissions;
//     };
//
//     return logPermissions;
// };
