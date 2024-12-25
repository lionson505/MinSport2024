import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, Trophy, Users, FileText, Building2, 
  Calendar, Award, School, MapPin 
} from 'lucide-react';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import axiosInstance from '../utils/axiosInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  // Fetch dashboard stats and charts data
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data;
    }
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/charts');
      return response.data;
    }
  });

  if (statsLoading || chartsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Chart configurations
  const athletePerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Performance Index',
      data: chartsData?.athletePerformance || [65, 70, 75, 72, 78, 82],
      fill: true,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const sportDistributionData = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Athletics', 'Swimming'],
    datasets: [{
      data: chartsData?.sportDistribution || [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="h-6 w-6 text-blue-600" />}
          value={statsData?.federations || 0}
          label="Federations"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          value={statsData?.athletes || 0}
          label="Athletes"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          icon={<Award className="h-6 w-6 text-green-600" />}
          value={statsData?.events || 0}
          label="Events"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          icon={<MapPin className="h-6 w-6 text-red-600" />}
          value={statsData?.facilities || 0}
          label="Facilities"
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Athlete Performance Trend */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Athlete Performance Trend</h3>
          <Line 
            data={athletePerformanceData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Sport Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sport Distribution</h3>
          <Doughnut 
            data={sportDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-lg p-4`}>
    <div className="flex items-center justify-between">
      {icon}
      <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
    </div>
    <span className={`text-sm ${textColor}`}>{label}</span>
  </div>
);

export default Dashboard;
