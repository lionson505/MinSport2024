import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {secureStorage} from "../utils/crypto.js";

const API_URL = import.meta.env.VITE_API_URL || 'https://mis.minisports.gov.rw/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Function to handle login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Store user data in localStorage
      await secureStorage.setItem('user', JSON.stringify(userData));

      // Attach token to Axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data in state
      setUser(userData);

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch authenticated user details
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please login again.');
      }

      // Attach token to Axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user data using the stored user ID
      const storedUser = await secureStorage.getItem('user');
      if (storedUser && storedUser.id) {
        // const response = await axiosAsync.get();
        const response = await axiosInstance.get(`/users/${storedUser.id}`)
        await setUser(response.data);

        return response.data;
      } else {
        throw new Error('User ID not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    secureStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // Initialize user if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const storedUser = await secureStorage.getItem('user');

          if (storedUser && storedUser.id) {
            await setUser(storedUser); // Use the user data from localStorage
            await fetchUser();
          }
          // else {
          //   // If user data is not in localStorage, try fetching it
          //   await fetchUser();
          // }
        } catch (error) {
          console.error('Error initializing user:', error.data);
        }
      }
    };
    initializeAuth();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    login,
    fetchUser,
    logout,
  };
}
