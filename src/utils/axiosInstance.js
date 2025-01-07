import axios from 'axios';

const axiosInstance = axios.create({
<<<<<<< HEAD
  baseURL:  import.meta.env.VITE_API_URL,
=======
      baseURL: import.meta.env.VITE_API_URL,
>>>>>>> d16b69089c79e358ea3a905f1a8ad386fe32a09a
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
