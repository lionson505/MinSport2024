import axios from 'axios';
import {secureStorage} from "./crypto.js";

const axiosInstance = axios.create({
  baseURL:  import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  } 
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      console.error('API error:', status, 'on', config?.url);
      if (status === 401) {
        // Unauthorized: token invalid/expired -> force logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden: keep session, redirect to not authorized page
        window.location.href = '/notAuthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
