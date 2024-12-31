// // import { useAuth } from '../contexts/AuthContext';
// //
// // export const usePermissions = () => {
// //     const { checkPermission } = useAuth();
// //
// //     return { checkPermission };
// // };
// //
// // export const hasPermission = (moduleId, action) => {
// //     const { checkPermission } = useAuth();
// //     return checkPermission(moduleId, action);
// // };
// //
//
// export const usePermissions = () => {
//     const checkPermission = (moduleId, action) => {
//         try {
//             // Get permissions from localStorage
//             const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//             console.log('Checking permissions for module:', moduleId, 'action:', action);
//             console.log('Available permissions:', permissions);
//
//             // Check if user has permission for this module
//             const modulePermission = permissions.find(p => p.moduleId === moduleId);
//             console.log('Found module permission:', modulePermission);
//
//             if (!modulePermission) {
//                 console.log('No permission found for module:', moduleId);
//                 return false;
//             }
//
//             // Check specific action permission
//             switch (action) {
//                 case 'read':
//                     return modulePermission.canRead;
//                 case 'create':
//                     return modulePermission.canCreate;
//                 case 'update':
//                     return modulePermission.canUpdate;
//                 case 'delete':
//                     return modulePermission.canDelete;
//                 default:
//                     return false;
//             }
//         } catch (error) {
//             console.error('Error checking permissions:', error);
//             return false;
//         }
//     };
//
//     // Helper function to check if module should be visible
//     const hasModuleAccess = (moduleId) => {
//         return checkPermission(moduleId, 'read');
//     };
//
//     return { checkPermission, hasModuleAccess };
// };
//
//
// import { useAuth } from '../contexts/AuthContext';
//
// export const usePermissions = () => {
//     const { checkPermission } = useAuth();
//
//     // Helper function to check if module should be visible
//     const hasModuleAccess = (moduleId) => {
//         console.log('Checking module access for:', moduleId);
//         return checkPermission(moduleId, 'read');
//     };
//
//     return {
//         checkPermission,
//         hasModuleAccess
//     };
// };
//
// // Static version of permission check for use outside of React components
// export const hasPermission = (moduleId, action) => {
//     try {
//         // Get permissions from localStorage
//         const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//         console.log('Checking static permissions for module:', moduleId, 'action:', action);
//         console.log('Available permissions:', permissions);
//
//         // Check if user has permission for this module
//         const modulePermission = permissions.find(p => p.moduleId === moduleId);
//         console.log('Found module permission:', modulePermission);
//
//         if (!modulePermission) {
//             console.log('No permission found for module:', moduleId);
//             return false;
//         }
//
//         // Check specific action permission
//         switch (action) {
//             case 'read':
//                 return modulePermission.canRead;
//             case 'create':
//                 return modulePermission.canCreate;
//             case 'update':
//                 return modulePermission.canUpdate;
//             case 'delete':
//                 return modulePermission.canDelete;
//             default:
//                 return false;
//         }
//     } catch (error) {
//         console.error('Error checking permissions:', error);
//         return false;
//     }
// };
//
import { useAuth } from '../contexts/AuthContext';

// export const usePermissions = () => {
//     const checkPermission = (moduleId, action) => {
//         try {
//             // Get permissions from localStorage
//             const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//             console.log('Checking permissions for module:', moduleId, 'action:', action);
//             console.log('Available permissions:', permissions);
//
//             // Check if user has permission for this module
//             const modulePermission = permissions.find(p => p.moduleId === moduleId);
//             console.log('Found module permission:', modulePermission);
//
//             if (!modulePermission) {
//                 console.log('No permission found for module:', moduleId);
//                 return false;
//             }
//
//             // Check specific action permission
//             switch (action) {
//                 case 'read':
//                     return modulePermission.canRead;
//                 case 'create':
//                     return modulePermission.canCreate;
//                 case 'update':
//                     return modulePermission.canUpdate;
//                 case 'delete':
//                     return modulePermission.canDelete;
//                 default:
//                     return false;
//             }
//         } catch (error) {
//             console.error('Error checking permissions:', error);
//             return false;
//         }
//     };
//
//     // Helper function to check if module should be visible
//     const hasModuleAccess = (moduleId) => {
//         console.log('Checking module access for:', moduleId);
//         return checkPermission(moduleId, 'read');
//     };
//
//     return {
//         checkPermission,
//         hasModuleAccess
//     };
// };
//
// // Static version of permission check for use outside of React components
// export const hasPermission = (moduleId, action) => {
//     try {
//         const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//         const modulePermission = permissions.find(p => p.moduleId === moduleId);
//         if (!modulePermission) return false;
//
//         switch (action) {
//             case 'read':
//                 return modulePermission.canRead;
//             case 'create':
//                 return modulePermission.canCreate;
//             case 'update':
//                 return modulePermission.canUpdate;
//             case 'delete':
//                 return modulePermission.canDelete;
//             default:
//                 return false;
//         }
//     } catch (error) {
//         console.error('Error checking permissions:', error);
//         return false;
//     }
// };
//
import { MODULE_IDS } from '../constants/modules';

export const usePermissions = () => {
    const checkPermission = (moduleId, action) => {
        try {
            const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
            console.log('Checking permissions for module:', moduleId, 'action:', action);
            console.log('Available permissions:', permissions);

            // Convert string moduleId to number if necessary
            const numericModuleId = typeof moduleId === 'string' ? MODULE_IDS[moduleId.toUpperCase()] : moduleId;

            const modulePermission = permissions.find(p => p.moduleId === numericModuleId);
            console.log('Found module permission:', modulePermission);

            if (!modulePermission) {
                console.log('No permission found for module:', moduleId);
                return false;
            }

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
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    };

    const hasModuleAccess = (moduleId) => {
        console.log('Checking module access for:', moduleId);
        return checkPermission(moduleId, 'read');
    };

    return { checkPermission, hasModuleAccess };
};

export const hasPermission = (moduleId, action) => {
    const { checkPermission } = usePermissions();
    return checkPermission(moduleId, action);
};
