import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,  // Import Filler plugin
  BarElement,
  ArcElement
} from 'chart.js';

// Register all required components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler  // Register Filler plugin
);

// Default chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart Title',
    },
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

// Line chart specific options
export const lineChartOptions = {
  ...defaultOptions,
  elements: {
    line: {
      tension: 0.4
    }
  }
};

// Bar chart specific options
export const barChartOptions = {
  ...defaultOptions,
  plugins: {
    ...defaultOptions.plugins,
    legend: {
      position: 'top',
    },
  },
};

// Pie/Doughnut chart specific options
export const pieChartOptions = {
  ...defaultOptions,
  plugins: {
    ...defaultOptions.plugins,
    legend: {
      position: 'right',
    },
  },
}; 