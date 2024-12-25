import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'https://mis.minisports.gov.rw/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Dashboard chart data endpoints
export const getDashboardChartData = async () => {
  try {
    const [statsResponse, matchesResponse, leaguesResponse] = await Promise.all([
      api.get('/stats'), // Fetch general statistics
      api.get('/matches/live'), // Fetch live matches
      api.get('/leagues') // Fetch leagues
    ]);

    return {
      stats: {
        federations: statsResponse.data.federations,
        clubs: statsResponse.data.clubs,
        clubPlayers: statsResponse.data.clubPlayers,
        sportTeams: statsResponse.data.sportTeams,
        teamPlayers: statsResponse.data.teamPlayers,
        officialsAndPlayers: statsResponse.data.officialsAndPlayers,
        isongaProgram: statsResponse.data.isongaProgram,
        students: statsResponse.data.students,
        infrastructure: statsResponse.data.infrastructure,
        documents: statsResponse.data.documents
      },
      liveMatches: matchesResponse.data,
      leagues: leaguesResponse.data
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    toast.error('Failed to fetch dashboard data');
    return {
      stats: {},
      liveMatches: [],
      leagues: []
    };
  }
};

// Report chart data endpoints
export const getReportChartData = async (reportType, filters = {}) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (reportType) {
      case 'performance':
        return {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          scores: [85, 92, 88, 95]
        };

      case 'attendance':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          attendance: [120, 150, 180, 190, 210, 230]
        };

      case 'gender':
        return {
          male: 65,
          female: 35
        };

      case 'age':
        return {
          labels: ['18-24', '25-34', '35-44', '45+'],
          data: [30, 40, 20, 10]
        };

      case 'regional':
        return {
          labels: ['Kigali', 'Eastern', 'Western', 'Northern', 'Southern'],
          data: [45, 15, 12, 18, 10]
        };

      default:
        return null;
    }
  } catch (error) {
    toast.error(`Failed to fetch ${reportType} report data`);
    throw error;
  }
};

// Export the api instance as default
export default api;
