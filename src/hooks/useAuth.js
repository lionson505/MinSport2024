import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axiosInstance.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error initializing user:', error);
      // If we get a 403, clear auth and redirect to login
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      toast.success(response.data.message || 'Registration successful');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register
  };
};
