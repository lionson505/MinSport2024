import { MODULE_IDS } from '../constants/modules';
import { secureStorage } from './crypto';

export const usePermissions = () => {
    const getPermissions = async () => {
        try {
            let permissions = [];
            const encryptedPerms = await secureStorage.getItem('permissions');

            if (encryptedPerms) {
                if (Array.isArray(encryptedPerms)) {
                    permissions = encryptedPerms;
                } else if (typeof encryptedPerms === 'string') {
                    try {
                        const parsedPerms = JSON.parse(encryptedPerms);
                        if (Array.isArray(parsedPerms)) {
                            permissions = parsedPerms;
                        } else {
                            console.error('Parsed permissions are not an array:', parsedPerms);
                        }
                    } catch (error) {
                        console.error('Error parsing encrypted permissions:', error);
                    }
                } else {
                    console.error('Encrypted permissions are not an array or string:', encryptedPerms);
                }
            } else {
                const rawPerms = localStorage.getItem('permissions');
                if (rawPerms) {
                    try {
                        const parsedPerms = JSON.parse(rawPerms);
                        if (Array.isArray(parsedPerms)) {
                            permissions = parsedPerms;
                        } else {
                            console.error('Parsed permissions from localStorage are not an array:', parsedPerms);
                        }
                    } catch (error) {
                        console.error('Error parsing permissions from localStorage:', error);
                    }
                }
            }

            return permissions;
        } catch (error) {
            console.error('Error retrieving permissions:', error);
            return [];
        }
    };

    const checkPermission = async (moduleId, action) => {
        try {
            const permissions = await getPermissions();

            if (!Array.isArray(permissions)) {
                console.error('Permissions is not an array:', permissions);
                return false;
            }

            const numericModuleId = typeof moduleId === 'string' ?
                MODULE_IDS[moduleId.toUpperCase()] : moduleId;

            const modulePermission = permissions.find(p => p && p.moduleId === numericModuleId);

            if (!modulePermission) {
                console.log(`No permissions found for module ID ${numericModuleId}`);
                return false;
            }

            switch (action) {
                case 'read': return Boolean(modulePermission.canRead);
                case 'create': return Boolean(modulePermission.canCreate);
                case 'update': return Boolean(modulePermission.canUpdate);
                case 'delete': return Boolean(modulePermission.canDelete);
                default:
                    console.error(`Invalid action: ${action}`);
                    return false;
            }
        } catch (error) {
            console.error('Permission check error:', error);
            return false;
        }
    };

    const hasModuleAccess = async (moduleId) => {
        return await checkPermission(moduleId, 'read');
    };

    return { checkPermission, hasModuleAccess };
};

export const hasPermissionSync = (moduleId, action) => {
    try {
        const rawPerms = localStorage.getItem('permissions');
        if (!rawPerms) {
            console.log('No permissions found in localStorage');
            return false;
        }

        let permissions;
        try {
            permissions = JSON.parse(rawPerms);
        } catch (error) {
            console.error('Error parsing permissions from localStorage:', error);
            return false;
        }

        if (!Array.isArray(permissions)) {
            console.error('Permissions is not an array:', permissions);
            return false;
        }

        const numericModuleId = typeof moduleId === 'string' ?
            MODULE_IDS[moduleId.toUpperCase()] : moduleId;

        const modulePermission = permissions.find(p => p && p.moduleId === numericModuleId);
        if (!modulePermission) {
            console.log(`No permissions found for module ID ${numericModuleId}`);
            return false;
        }

        switch (action) {
            case 'read': return Boolean(modulePermission.canRead);
            case 'create': return Boolean(modulePermission.canCreate);
            case 'update': return Boolean(modulePermission.canUpdate);
            case 'delete': return Boolean(modulePermission.canDelete);
            default:
                console.error(`Invalid action: ${action}`);
                return false;
        }
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
};







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
// import { MODULE_IDS } from '../constants/modules';
// import {secureStorage} from "./crypto.js";
//
// export const usePermissions = () => {
//     const checkPermission = async (moduleId, action) => {
//         try {
//              // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//             const permissions = await  JSON.parse(secureStorage.getItem('permissions') || '[]');
//
//             console.log('Checking permissions for module:', moduleId, 'action:', action);
//             console.log('Available permissions:', permissions);
//
//             // Convert string moduleId to number if necessary
//             const numericModuleId = typeof moduleId === 'string' ? MODULE_IDS[moduleId.toUpperCase()] : moduleId;
//
//             const modulePermission = permissions.find(p => p.moduleId === numericModuleId);
//             console.log('Found module permission:', modulePermission);
//
//             if (!modulePermission) {
//                 console.log('No permission found for module:', moduleId);
//                 return false;
//             }
//
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
//     const hasModuleAccess = (moduleId) => {
//         console.log('Checking module access for:', moduleId);
//         return checkPermission(moduleId, 'read');
//     };
//
//     return { checkPermission, hasModuleAccess };
// };
//
// export const hasPermission = (moduleId, action) => {
//     const { checkPermission } = usePermissions();
//     return checkPermission(moduleId, action);
// };
// permissionUtils.js
// import { MODULE_IDS } from '../constants/modules';
// import { secureStorage } from './cyrpto';

// export const usePermissions = () => {
    // const checkPermission = async (moduleId, action) => {
    //     try {
    //         let permissions = [];
    //         const encryptedPerms = await secureStorage.getItem('permissions');
    //
    //         if (encryptedPerms && Array.isArray(encryptedPerms)) {
    //             permissions = encryptedPerms;
    //         } else {
    //             const rawPerms = localStorage.getItem('permissions');
    //             if (rawPerms) {
    //                 try {
    //                     permissions = JSON.parse(rawPerms);
    //                 } catch {
    //                     permissions = [];
    //                 }
    //             }
    //         }
    //
    //         if (!Array.isArray(permissions)) {
    //             permissions = [];
    //         }
    //
    //         const numericModuleId = typeof moduleId === 'string' ?
    //             MODULE_IDS[moduleId.toUpperCase()] : moduleId;
    //
    //         const modulePermission = permissions.find(p => p && p.moduleId === numericModuleId);
    //
    //         if (!modulePermission) {
    //             return false;
    //         }
    //
    //         switch (action) {
    //             case 'read': return Boolean(modulePermission.canRead);
    //             case 'create': return Boolean(modulePermission.canCreate);
    //             case 'update': return Boolean(modulePermission.canUpdate);
    //             case 'delete': return Boolean(modulePermission.canDelete);
    //             default: return false;
    //         }
    //     } catch (error) {
    //         console.error('Permission check error:', error);
    //         return false;
    //     }
    // };

//     const checkPermission = async (moduleId, action) => {
//         try {
//             let permissions = [];
//             const encryptedPerms = await secureStorage.getItem('permissions');
//
//             if (encryptedPerms && Array.isArray(encryptedPerms)) {
//                 permissions = encryptedPerms;
//             } else {
//                 const rawPerms = localStorage.getItem('permissions');
//                 if (rawPerms) {
//                     try {
//                         permissions = JSON.parse(rawPerms);
//                     } catch (error) {
//                         console.error('Error parsing permissions:', error);
//                         return false;
//                     }
//                 }
//             }
//
//             if (!Array.isArray(permissions)) {
//                 console.error('Permissions is not an array');
//                 return false;
//             }
//
//             const numericModuleId = typeof moduleId === 'string' ?
//                 MODULE_IDS[moduleId.toUpperCase()] : moduleId;
//
//             const modulePermission = permissions.find(p => p && p.moduleId === numericModuleId);
//
//             if (!modulePermission) {
//                 console.log(`No permissions found for module ID ${numericModuleId}`);
//                 return false;
//             }
//
//             switch (action) {
//                 case 'read': return Boolean(modulePermission.canRead);
//                 case 'create': return Boolean(modulePermission.canCreate);
//                 case 'update': return Boolean(modulePermission.canUpdate);
//                 case 'delete': return Boolean(modulePermission.canDelete);
//                 default:
//                     console.error(`Invalid action: ${action}`);
//                     return false;
//             }
//         } catch (error) {
//             console.error('Permission check error:', error);
//             return false;
//         }
//     };
//
//     const hasModuleAccess = async (moduleId) => {
//         return await checkPermission(moduleId, 'read');
//     };
//
//     return { checkPermission, hasModuleAccess };
// };
//
// export const hasPermissionSync = (moduleId, action) => {
//     try {
//         const rawPerms = localStorage.getItem('permissions');
//         if (!rawPerms) return false;
//
//         let permissions;
//         try {
//             permissions = JSON.parse(rawPerms);
//         } catch {
//             return false;
//         }
//
//         if (!Array.isArray(permissions)) {
//             return false;
//         }
//
//         const numericModuleId = typeof moduleId === 'string' ?
//             MODULE_IDS[moduleId.toUpperCase()] : moduleId;
//
//         const modulePermission = permissions.find(p => p && p.moduleId === numericModuleId);
//         if (!modulePermission) return false;
//
//         switch (action) {
//             case 'read': return Boolean(modulePermission.canRead);
//             case 'create': return Boolean(modulePermission.canCreate);
//             case 'update': return Boolean(modulePermission.canUpdate);
//             case 'delete': return Boolean(modulePermission.canDelete);
//             default: return false;
//         }
//     } catch {
//         return false;
//     }
// };