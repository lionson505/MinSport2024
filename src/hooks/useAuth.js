import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

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
      localStorage.setItem('user', JSON.stringify(userData));

      // Attach token to Axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data in state
      setUser(userData);

      // Fetch and store additional user details
      await fetchUserDetailsByEmail(userData.email);

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch user details by email
  const fetchUserDetailsByEmail = useCallback(async (email) => {
    try {
      // Log the API URL to the console
      console.log('Fetching user details from:', `${API_URL}/users/email/${encodeURIComponent(email)}`);

      const response = await axios.get(`${API_URL}/users/email/${encodeURIComponent(email)}`);
      const userDetails = response.data;

      // Log the full user details to verify the API response
      console.log('API Response User Details:', userDetails);

      // Store detailed user data in localStorage
      localStorage.setItem('userDetails', JSON.stringify(userDetails));

      // Update the user state with detailed data
      setUser((prevUser) => ({
        ...prevUser,
        ...userDetails,
      }));

      // Log user details to the console
      console.log('Updated User State:', userDetails);
    } catch (err) {
      console.error('Failed to fetch user details by email:', err);
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
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        const response = await axios.get(`${API_URL}/users/email/${encodeURIComponent(email)}`);
        setUser(response.data);

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
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // Initialize user if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));

          if (storedUser && storedUser.id) {
            setUser(storedUser); // Use the user data from localStorage
            await fetchUser();
          } else {
            // If user data is not in localStorage, try fetching it
            await fetchUser();
          }
        } catch (error) {
          console.error('Error initializing user:', error);
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
