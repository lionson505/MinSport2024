// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// //
// // const AuthContext = createContext();
// //
// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [permissions, setPermissions] = useState([]);
// //   const navigate = useNavigate();
// //
// //   const fetchUser = async () => {
// //     try {
// //       const storedUser = localStorage.getItem('user');
// //       const storedPermissions = localStorage.getItem('accessibleLinks');
// //
// //       if (storedUser) {
// //         const parsedUser = JSON.parse(storedUser);
// //         setUser(parsedUser);
// //         // Ensure permissions are loaded
// //         if (storedPermissions) {
// //           setPermissions(JSON.parse(storedPermissions));
// //         } else {
// //           // Trigger permission fetch if not in localStorage
// //           await fetchPermissions(parsedUser);
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Failed to fetch user:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //
// //   // New method to fetch permissions
// //   const fetchPermissions = async (userData) => {
// //     try {
// //       // Replace with your actual API call to get permissions
// //       const response = await fetch('/api/user-permissions', {
// //         headers: {
// //           'Authorization': `Bearer ${userData.token}`
// //         }
// //       });
// //
// //       if (response.ok) {
// //         const permissionsData = await response.json();
// //         localStorage.setItem('accessibleLinks', JSON.stringify(permissionsData));
// //         setPermissions(permissionsData);
// //       }
// //     } catch (error) {
// //       console.error('Failed to fetch permissions:', error);
// //     }
// //   };
// //
// //   const login = async (userData) => {
// //     localStorage.setItem('user', JSON.stringify(userData));
// //     localStorage.setItem('token', userData.token);
// //     setUser(userData);
// //
// //     // Fetch permissions immediately after login
// //     await fetchPermissions(userData);
// //     window.location.reload()
// //   };
// //
// //   const logout = async () => {
// //     return new Promise((resolve) => {
// //       setTimeout(() => {
// //         localStorage.removeItem('user');
// //         localStorage.removeItem('token');
// //         localStorage.removeItem('accessibleLinks');
// //         setUser(null);
// //         setPermissions([]);
// //         navigate('/home');
// //         resolve();
// //       }, 1000);
// //     });
// //   };
// //
// //   useEffect(() => {
// //     fetchUser();
// //   }, []);
// //
// //   return (
// //       <AuthContext.Provider value={{
// //         user,
// //         login,
// //         logout,
// //         loading,
// //         permissions
// //       }}>
// //         {loading ? <div>Loading...</div> : children}
// //       </AuthContext.Provider>
// //   );
// // };
// //
// // export const useAuth = () => useContext(AuthContext);
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../utils/axiosInstance';
//
// const AuthContext = createContext();
//
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//
//   const fetchUser = async () => {
//     try {
//       const storedUser = localStorage.getItem('user');
//       if (storedUser) {
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//         await fetchPermissions(parsedUser.userGroup.id);
//       }
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const fetchPermissions = async (groupId) => {
//     try {
//       const response = await axiosInstance.get(`/permissions/groups/${groupId}`);
//       const permissions = response.data;
//       localStorage.setItem('permissions', JSON.stringify(permissions));
//     } catch (error) {
//       console.error('Failed to fetch permissions:', error);
//     }
//   };
//
//   const login = async (userData) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('token', userData.token);
//     setUser(userData);
//     await fetchPermissions(userData.userGroup.id);
//   };
//
//   const logout = async () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     localStorage.removeItem('permissions');
//     setUser(null);
//     navigate('/login');
//   };
//
//   const checkPermission = (moduleId, action) => {
//     if (user?.userGroup.name === 'admin') return true;
//
//     const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
//     const modulePermission = permissions.find((p) => p.moduleId === moduleId);
//
//     if (!modulePermission) return false;
//
//     switch (action) {
//       case 'read':
//         return modulePermission.canRead;
//       case 'create':
//         return modulePermission.canCreate;
//       case 'update':
//         return modulePermission.canUpdate;
//       case 'delete':
//         return modulePermission.canDelete;
//       default:
//         return false;
//     }
//   };
//
//   useEffect(() => {
//     fetchUser();
//   }, []);
//
//   return (
//       <AuthContext.Provider value={{
//         user,
//         login,
//         logout,
//         loading,
//         checkPermission
//       }}>
//         {loading ? <div>Loading...</div> : children}
//       </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
//

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import {secureStorage} from "../utils/crypto.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const storedUser = await secureStorage.getItem('user');
      if (storedUser) {
        const parsedUser = await JSON.parse(storedUser);
        await setUser(parsedUser);
        await fetchPermissions(parsedUser.userGroup.id);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (groupId) => {
    try {
      const response = await axiosInstance.get(`/permissions/groups/${groupId}`);
      const permissions = response.data;
      // localStorage.setItem('permissions', JSON.stringify(permissions));
      await secureStorage.setItem('permissions', JSON.stringify(permissions));
      console.log('Permissions set in localStorage:', permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const login = async (userData) => {
    // localStorage.setItem('user', JSON.stringify(userData));
    await secureStorage.setItem('user', JSON.stringify(userData));
    // localStorage.setItem('token', userData.token);
    // await secureStorage.setItem('token', userData.token);
    setUser(userData);
    await fetchPermissions(userData.userGroup.id);
    localStorage.setItem('token', userData.token);
    setUser(userData);
    await fetchPermissions(userData.userGroup.id);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    secureStorage.clear()
    localStorage.clear()
    setUser(null);
    navigate('/login');

  };

  const checkPermission = async (moduleId, action) => {
    // if (user?.userGroup.name === 'admin') return true;

    // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const permissions = await JSON.parse(secureStorage.getItem('permissions') || '[]');

    const modulePermission = await permissions.find((p) => p.moduleId === moduleId);

    if (!modulePermission) return false;

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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
      <AuthContext.Provider value={{
        user,
        login,
        logout,
        loading,
        checkPermission
      }}>
        {loading ? <div>Loading...</div> : children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

