// // import { useState, useEffect } from 'react';
// // import { hasModulePermission } from '../utils/permissionUtils';
// //
// // export const usePermissions = () => {
// //     const [permissions, setPermissions] = useState([]);
// //
// //     useEffect(() => {
// //         try {
// //             const storedPermissions = localStorage.getItem('permissions');
// //             if (storedPermissions) {
// //                 setPermissions(JSON.parse(storedPermissions));
// //             }
// //         } catch (error) {
// //             console.error('Error loading permissions:', error);
// //             setPermissions([]);
// //         }
// //     }, []);
// //
// //     const checkPermission = (moduleId, action = 'read') => {
// //         if (localStorage.getItem('userRole') === 'admin') {
// //             return true;
// //         }
// //         return hasModulePermission(moduleId, action);
// //     };
// //
// //     return { permissions, checkPermission };
// // };
// // src/hooks/usePermissions.js
// import { useState, useEffect } from 'react';
// import { getModulePermissions, hasModulePermission } from '../utils/permissionUtils';
//
// export const usePermissions = () => {
//     const [permissions, setPermissions] = useState([]);
//
//     useEffect(() => {
//         const loadPermissions = () => {
//             try {
//                 const perms = getModulePermissions();
//                 setPermissions(perms);
//             } catch (error) {
//                 console.error('Error loading permissions:', error);
//                 setPermissions([]);
//             }
//         };
//
//         loadPermissions();
//     }, []);
//
//     const checkPermission = (moduleId, action = 'read') => {
//         if (localStorage.getItem('userRole') === 'admin') {
//             return true;
//         }
//         return hasModulePermission(moduleId, action);
//     };
//
//     return { permissions, checkPermission };
// };