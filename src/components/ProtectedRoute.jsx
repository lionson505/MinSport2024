// // // import { Navigate } from 'react-router-dom';
// // //
// // // const ProtectedRoute = ({ moduleId, children }) => {
// // //   const token = localStorage.getItem('token');
// // //   const userRole = localStorage.getItem('userRole');
// // //
// // //   const checkAccess = () => {
// // //     if (!token) return false;
// // //     if (userRole === 'admin') return true;
// // //
// // //     try {
// // //       const accessibleLinks = localStorage.getItem('accessibleLinks');
// // //       if (!accessibleLinks) return false;
// // //
// // //       const parsedLinks = JSON.parse(accessibleLinks);
// // //       return parsedLinks.some(link =>
// // //         link.moduleId === moduleId && link.canRead
// // //       );
// // //     } catch (error) {
// // //       return false;
// // //     }
// // //   };
// // //
// // //   if (!token) return <Navigate to="/login" />;
// // //   if (!checkAccess()) return <Navigate to="/unauthorized" />;
// // //
// // //   return children;
// // // };
// // //
// // // export default ProtectedRoute;
// //
// // // src/components/ProtectedRoute.jsx
// // // import React from 'react';
// // // import { Navigate } from 'react-router-dom';
// // // import { hasModulePermission } from '../utils/permissionUtils';
// // //
// // // const ProtectedRoute = ({ children, moduleId }) => {
// // //   const moduleName = moduleId.toLowerCase();
// // //
// // //   if (!hasModulePermission(moduleName)) {
// // //     return <Navigate to="/unauthorized" replace />;
// // //   }
// // //
// // //   return children;
// // // };
// // //
// // // export default ProtectedRoute;
// // // components/ProtectedRoute.jsx
// // // import { Navigate } from 'react-router-dom';
// // // import { hasPermission } from '../utils/permissionUtils';
// // //
// // // const ProtectedRoute = ({ children, moduleId }) => {
// // //   const hasAccess = hasPermission(moduleId, 'read');
// // //
// // //   if (!hasAccess) {
// // //     return <Navigate to="/unauthorized" replace />;
// // //   }
// // //
// // //   return children;
// // // };
// // //
// // // export default ProtectedRoute;
// // import React from 'react';
// // import { Navigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../contexts/AuthContext';
// // import { usePermissions } from '../utils/permissionUtils';
// //
// // const ProtectedRoute = ({ children, moduleId }) => {
// //   const { user } = useAuth();
// //   const location = useLocation();
// //   const { checkPermission } = usePermissions();
// //
// //   console.log('ProtectedRoute - Checking access for module:', moduleId);
// //   console.log('Current user:', user);
// //
// //   if (!user) {
// //     console.log('No user found, redirecting to login');
// //     return <Navigate to="/login" state={{ from: location }} replace />;
// //   }
// //
// //   if (moduleId && !checkPermission(moduleId, 'read')) {
// //     console.log('User does not have permission for module:', moduleId);
// //     return <Navigate to="/unauthorized" replace />;
// //   }
// //
// //   console.log('Access granted for module:', moduleId);
// //   return children;
// // };
// //
// // export default ProtectedRoute;
// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { usePermissions } from '../utils/permissionUtils';
//
// const ProtectedRoute = ({ children, moduleId }) => {
//   const { user } = useAuth();
//   const location = useLocation();
//   const { hasModuleAccess } = usePermissions();
//
//   console.log('ProtectedRoute - Checking access for module:', moduleId);
//   console.log('Current user:', user);
//
//   if (!user) {
//     console.log('No user found, redirecting to login');
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }
//
//   if (moduleId && !hasModuleAccess(moduleId)) {
//     console.log('User does not have permission for module:', moduleId);
//     return <Navigate to="/notAuthorized" replace />;
//   }
//
//   console.log('Access granted for module:', moduleId);
//   return children;
// };
//
// export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../utils/permissionUtils';
import { MODULE_IDS } from '../constants/modules';

const ProtectedRoute =  ({ children, moduleId }) => {

  const { user } =  useAuth();
  const location =  useLocation();
  const { hasModuleAccess } =  usePermissions();

  console.log('ProtectedRoute - Checking access for module:', moduleId);
  console.log('Current user:', user);

  //fallback for getting user





  if (!user) {
    const user =  secureStorage.getItem('user')
    if(user === null || user === undefined ){
      console.log('No user found, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

  }

  const numericModuleId = MODULE_IDS[moduleId] || moduleId;

  if (numericModuleId && !hasModuleAccess(numericModuleId)) {
    console.log('User does not have permission for module:', moduleId);
    return <Navigate to="/notAuthorized" replace />;
  }

  console.log('Access granted for module:', moduleId);
  return children;
};

export default ProtectedRoute;





























