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
            // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
            const permissions =
                [{"id":2,"groupId":1,"moduleId":5,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":5,"name":"dashboard","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":3,"groupId":1,"moduleId":2,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":2,"name":"national_teams","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":4,"groupId":1,"moduleId":3,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":3,"name":"federations","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":5,"groupId":1,"moduleId":4,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":4,"name":"sports_professionals","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":6,"groupId":1,"moduleId":6,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":6,"name":"trainings","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":7,"groupId":1,"moduleId":7,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":7,"name":"isonga_programs","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":8,"groupId":1,"moduleId":8,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":8,"name":"academies","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":9,"groupId":1,"moduleId":9,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":9,"name":"infrastructure","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":10,"groupId":1,"moduleId":10,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":10,"name":"sports_tourism","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":11,"groupId":1,"moduleId":11,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":11,"name":"documents","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":12,"groupId":1,"moduleId":12,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":12,"name":"contracts","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":13,"groupId":1,"moduleId":13,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":13,"name":"appointments","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":14,"groupId":1,"moduleId":14,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":14,"name":"employee","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":15,"groupId":1,"moduleId":15,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":15,"name":"users","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":16,"groupId":1,"moduleId":16,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":16,"name":"partners","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":17,"groupId":1,"moduleId":17,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":17,"name":"reports","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":18,"groupId":1,"moduleId":18,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":18,"name":"sports_for_all","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":19,"groupId":1,"moduleId":19,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":19,"name":"player_transfer_report","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
                    {"id":20,"groupId":1,"moduleId":20,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":20,"name":"match_operator","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}}
                ]

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
