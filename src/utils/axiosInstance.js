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

export default axiosInstance;
