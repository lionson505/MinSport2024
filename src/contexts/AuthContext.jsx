/* src/contexts/AuthContext.jsx */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { secureStorage } from "../utils/crypto.js";

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
      await secureStorage.setItem('permissions', JSON.stringify(permissions));
      // console.log('Permissions set in localStorage:', permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const login = async (userData) => {
    await secureStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    await fetchPermissions(userData.userGroup.id);
    localStorage.setItem('token', userData.token);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    secureStorage.clear();
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  const checkPermission = async (moduleId, action) => {
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
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        children
      )}
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

// Add this CSS to your styles
const styles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #09f;
    animation: spin 1s ease infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
