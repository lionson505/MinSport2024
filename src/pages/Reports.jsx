import React, { useState } from 'react';
import { UserSquare2, School2, Building2 } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import * as XLSX from "xlsx";
import ChartDownloadWrapper from '../components/reusable/chartDownloader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {

const downloadChartAsExcel = (chartData, fileName) => {
  // Convert data to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(chartData.datasets[0].data.map((value, index) => ({
    Label: chartData.labels[index],
    Value: value,
  })));

  // Create workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");

  // Write and download the Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
  const [activeTab, setActiveTab] = useState('sports-professionals');
  const { isDarkMode } = useDarkMode();

  // Sample data - Replace with your actual data
  const disciplineGenderData = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Rugby', 'Athletics'],
    datasets: [
      {
        label: 'Male',
        data: [65, 45, 30, 40, 25],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Female',
        data: [35, 30, 25, 20, 30],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [205, 140],
      backgroundColor: [
        'rgba(53, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ],
    }],
  };

  const ageGroupData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '55+'],
    datasets: [{
      label: 'Professionals by Age Group',
      data: [45, 85, 65, 35, 15],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }],
  };

  const disciplineData = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Rugby', 'Athletics', 'Others'],
    datasets: [{
      data: [100, 75, 55, 60, 55, 45],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
    }],
  };

  // Add new data for Isonga Program reports
  const studentsByGameAndGender = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Athletics', 'Swimming'],
    datasets: [
      {
        label: 'Male',
        data: [45, 30, 25, 20, 15],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Female',
        data: [25, 20, 15, 15, 10],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const studentsByGame = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Athletics', 'Swimming', 'Others'],
    datasets: [{
      data: [70, 50, 40, 35, 25, 20],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
    }],
  };

  const studentsByCenter = {
    labels: ['Center A', 'Center B', 'Center C', 'Center D', 'Center E'],
    datasets: [{
      label: 'Number of Students',
      data: [120, 98, 85, 75, 65],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }],
  };

  const centersByDistrict = {
    labels: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Rubavu', 'Huye'],
    datasets: [{
      label: 'Number of Centers',
      data: [8, 6, 5, 4, 4, 3],
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
    }],
  };

  const studentsByDistrict = {
    labels: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Rubavu', 'Huye'],
    datasets: [{
      label: 'Number of Students',
      data: [250, 180, 150, 120, 100, 90],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
    }],
  };

  const studentsByAgeGroup = {
    labels: ['6-8', '9-11', '12-14', '15-17', '18-20'],
    datasets: [{
      label: 'Students by Age Group',
      data: [85, 120, 150, 100, 45],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }],
  };

  // Add new data for Infrastructure reports
  const infrastructureByProvince = {
    labels: ['Kigali City', 'Eastern', 'Western', 'Northern', 'Southern'],
    datasets: [{
      label: 'Number of Facilities',
      data: [45, 35, 30, 25, 28],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    }],
  };

  const infrastructureByDistrict = {
    labels: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Rubavu', 'Huye', 'Muhanga', 'Rusizi'],
    datasets: [{
      label: 'Number of Facilities',
      data: [18, 15, 12, 10, 8, 7, 6, 5],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const infrastructureBySport = {
    labels: ['Football', 'Basketball', 'Volleyball', 'Swimming', 'Tennis', 'Athletics', 'Rugby'],
    datasets: [{
      label: 'Number of Facilities',
      data: [35, 25, 20, 15, 12, 10, 8],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(201, 203, 207, 0.8)',
      ],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
  };

  const tabs = [
    {
      id: 'sports-professionals',
      label: 'Sports Professionals',
      icon: UserSquare2
    },
    {
      id: 'isonga-program',
      label: 'Isonga Program',
      icon: School2
    },
    {
      id: 'infrastructure',
      label: 'Sports Infrastructure',
      icon: Building2
    }
  ];

  const renderSportsProfessionalsReport = () => (

    <div className="space-y-8">
        {/* By Discipline and Gender */}
        <ChartDownloadWrapper chartData={disciplineData} fileName={"Distribution by Discipline and Gender"}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Distribution by Discipline and Gender
        </h3>
        <div className="h-[400px]">
          <Bar data={disciplineGenderData} options={chartOptions} />
        </div>
      </div>
      </ChartDownloadWrapper>

      {/* Gender Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gender Distribution
          </h3>
          <div className="h-[300px]">
            <Pie data={genderData} options={pieChartOptions} />
          </div>
        </div>

        {/* Age Group Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Age Group Distribution
          </h3>
          <div className="h-[300px]">
            
            <Bar data={ageGroupData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Discipline Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Distribution by Discipline
        </h3>
        <div className="h-[400px]">
          <Doughnut data={disciplineData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );

  // Add this new render function for Isonga Program reports
  const renderIsongaProgramReport = () => (
    <div className="space-y-8">
      {/* Students by Game & Gender */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Students by Game & Gender
        </h3>
        <div className="h-[400px]">
          <Bar data={studentsByGameAndGender} options={chartOptions} />
        </div>
        <button
          onClick={() => downloadChartAsExcel(studentsByGameAndGender, "students_by_game_and_gender")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Download as Excel
        </button>
      </div>
  
      {/* Students by Game */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Students by Game
          </h3>
          <div className="h-[300px]">
            <Pie data={studentsByGame} options={pieChartOptions} />
          </div>
          <button
            onClick={() => downloadChartAsExcel(studentsByGame, "students_by_game")}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Download as Excel
          </button>
        </div>
  
        {/* Students by Center */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Students by Center
          </h3>
          <div className="h-[300px]">
            <Bar data={studentsByCenter} options={chartOptions} />
          </div>
          <button
            onClick={() => downloadChartAsExcel(studentsByCenter, "students_by_center")}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Download as Excel
          </button>
        </div>
      </div>
    </div>
  );
  

  // Add this new render function for Infrastructure reports
  const renderInfrastructureReport = () => (
    <div className="space-y-8">
      {/* Infrastructure by Province */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Infrastructure Distribution by Province
        </h3>
        <div className="h-[400px]">
          <Pie data={infrastructureByProvince} options={{
            ...pieChartOptions,
            plugins: {
              ...pieChartOptions.plugins,
              title: {
                display: true,
                text: 'Total Facilities by Province',
                color: isDarkMode ? '#fff' : '#000',
              },
            },
          }} />
        </div>
      </div>

      {/* Infrastructure by District */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Infrastructure Distribution by District
        </h3>
        <div className="h-[400px]">
          <Bar data={infrastructureByDistrict} options={{
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
              ...chartOptions.plugins,
              title: {
                display: true,
                text: 'Facilities Count by District',
                color: isDarkMode ? '#fff' : '#000',
              },
            },
          }} />
        </div>
      </div>

      {/* Infrastructure by Sport */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Infrastructure Distribution by Sport
        </h3>
        <div className="h-[400px]">
          <Doughnut data={infrastructureBySport} options={{
            ...pieChartOptions,
            plugins: {
              ...pieChartOptions.plugins,
              title: {
                display: true,
                text: 'Facilities Distribution Across Sports',
                color: isDarkMode ? '#fff' : '#000',
              },
            },
          }} />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Facilities
          </h4>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            163
          </p>
        </div>
        <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Districts Covered
          </h4>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            28
          </p>
        </div>
        <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sports Supported
          </h4>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            7
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Reports
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View and analyze different reports across the system
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'sports-professionals' && renderSportsProfessionalsReport()}
        {activeTab === 'isonga-program' && renderIsongaProgramReport()}
        {activeTab === 'infrastructure' && renderInfrastructureReport()}
      </div>
    </div>
  );
};

export default Reports; 