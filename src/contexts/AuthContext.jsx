import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('accessibleLinks');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Ensure permissions are loaded
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        } else {
          // Trigger permission fetch if not in localStorage
          await fetchPermissions(parsedUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  // New method to fetch permissions
  const fetchPermissions = async (userData) => {
    try {
      // Replace with your actual API call to get permissions
      const response = await fetch('/api/user-permissions', {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });

      if (response.ok) {
        const permissionsData = await response.json();
        localStorage.setItem('accessibleLinks', JSON.stringify(permissionsData));
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const login = async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setUser(userData);

    // Fetch permissions immediately after login
    await fetchPermissions(userData);
    window.location.reload()
  };

  const logout = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('accessibleLinks');
        setUser(null);
        setPermissions([]);
        navigate('/landing');
        resolve();
      }, 1000);
    });
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
        permissions
      }}>
        {loading ? <div>Loading...</div> : children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);