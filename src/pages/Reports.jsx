import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import { Button } from '../components/ui/Button';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    federation: '',
    region: '',
    reportType: 'performance'
  });

  // Fetch report data based on filters
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports', { params: filters });
      return response.data;
    }
  });

  // Fetch federations for filter dropdown
  const { data: federations } = useQuery({
    queryKey: ['federations'],
    queryFn: async () => {
      const response = await axiosInstance.get('/federations');
      return response.data;
    }
  });

  // Chart configurations
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Performance Metrics',
      data: reportData?.performanceMetrics || [],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const athleteDistributionData = {
    labels: reportData?.athleteDistribution?.map(item => item.category) || [],
    datasets: [{
      data: reportData?.athleteDistribution?.map(item => item.count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };

  const facilityUsageData = {
    labels: reportData?.facilityUsage?.map(item => item.facility) || [],
    datasets: [{
      label: 'Usage Hours',
      data: reportData?.facilityUsage?.map(item => item.hours) || [],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1
    }]
  };

  const competitionResultsData = {
    labels: ['Technical', 'Physical', 'Tactical', 'Mental'],
    datasets: [{
      label: 'Performance Metrics',
      data: reportData?.competitionResults || [80, 70, 85, 75],
      fill: true,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgb(139, 92, 246)',
      pointBackgroundColor: 'rgb(139, 92, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(139, 92, 246)'
    }]
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          className="border rounded p-2"
        />
        <select
          value={filters.federation}
          onChange={(e) => setFilters(prev => ({ ...prev, federation: e.target.value }))}
          className="border rounded p-2"
        >
          <option value="">All Federations</option>
          {federations?.map(fed => (
            <option key={fed.id} value={fed.id}>{fed.name}</option>
          ))}
        </select>
        <select
          value={filters.reportType}
          onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
          className="border rounded p-2"
        >
          <option value="performance">Performance</option>
          <option value="attendance">Attendance</option>
          <option value="facilities">Facilities</option>
        </select>
        <Button 
          onClick={() => setFilters(prev => ({...prev}))}
          className="bg-blue-600 text-white"
        >
          Generate Report
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <Bar data={performanceData} />
        </div>

        {/* Athlete Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Athlete Distribution</h3>
          <Pie data={athleteDistributionData} />
        </div>

        {/* Facility Usage */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Facility Usage</h3>
          <Line data={facilityUsageData} />
        </div>

        {/* Competition Results */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Competition Results</h3>
          <Radar data={competitionResultsData} />
        </div>
      </div>
    </div>
  );
};

export default Reports; 