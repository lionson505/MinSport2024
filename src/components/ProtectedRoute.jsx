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




import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../utils/permissionUtils';
import { secureStorage } from '../utils/crypto';
import {Loader2} from 'lucide-react';

const ProtectedRoute = ({ children, moduleId }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { hasModuleAccess } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Synchronous handler for access control
  const checkAccess = async () => {
    try {
      const storedUser = user || (await secureStorage.getItem('user'));
      if (!storedUser) {
        setLoading(false);
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // If no moduleId is provided, allow access
      if (!moduleId) {
        setHasAccess(true);
        setLoading(false);
        return children;
      }

      // Check module access permissions
      const access = await hasModuleAccess(moduleId);
      setHasAccess(access);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Trigger access check immediately (inline async function)
  if (loading) {
    checkAccess(); // Avoid `useEffect` by invoking directly.
    return <div className="flex animate-spin animate justify-center items-center h-screen">
      <Loader2/>
    </div>;
  }

  // Redirect if no access
  if (!hasAccess) {
    if (!loading) {
      return <Navigate to="/notAuthorized" replace/>;
    }
  }

  // Render children on successful access
  return children;
};

export default ProtectedRoute;






























