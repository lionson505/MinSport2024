import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../ui/table';
import { Search, Filter, X, Download, FileText } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const PlayerTransferReport = () => {
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    federation: '',
    clubFrom: '',
    playerStaff: '',
    clubTo: '',
    month: '',
    year: ''
  });
  const [entriesPerPage, setEntriesPerPage] = useState('100');

  //Fetching players
  // useEffect(() => {
  //   if ()
  // })

  // Sample transfer data
  const transferData = [
    {
      id: 1,
      federation: 'Fédération Rwandaise de Cyclisme',
      clubFrom: 'ETINCELLES FC',
      playerStaff: 'Club1 Player2',
      clubTo: '',
      month: 'Sep',
      year: '2016'
    },
    {
      id: 2,
      federation: 'Fédération Rwandaise de Cyclisme',
      clubFrom: 'ETINCELLES FC',
      playerStaff: 'CLub1 Player1',
      clubTo: '',
      month: 'Sep',
      year: '2016'
    }
  ];

  // Filter options
  const filterOptions = {
    federation: ['FERWAFA', 'FERWABA', 'Fédération Rwandaise de Cyclisme'],
    clubFrom: ['APR FC', 'ETINCELLES FC', 'RAYON SPORTS'],
    clubTo: ['APR FC', 'ETINCELLES FC', 'RAYON SPORTS'],
    PlayerOrStaff:  ['Jihadi', 'Rwatubye', 'bakame'],
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    year: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016']
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = (format) => {
    // Implement export functionality (CSV, PDF, etc.)
    console.log(`Exporting in ${format} format`);
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Search Transfers
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Federation */}
          <div>
            <label htmlFor="federation" className={labelClasses}>Federation:</label>
            <select
              id="federation"
              value={filters.federation}
              onChange={(e) => handleFilterChange('federation', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Federation</option>
              {filterOptions.federation.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Club From */}
          <div>
            <label htmlFor="clubFrom" className={labelClasses}>Club From:</label>
            <select
              id="clubFrom"
              value={filters.clubFrom}
              onChange={(e) => handleFilterChange('clubFrom', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Club</option>
              {filterOptions.clubFrom.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Player/Staff */}
          <div>
            <label htmlFor="playerStaff" className={labelClasses}>Player/Staff:</label>
            <select
              id="playerStaff"
              value={filters.playerStaff}
              onChange={(e) => handleFilterChange('playerStaff', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Player/Staff</option>
              {filterOptions.PlayerOrStaff.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Club To */}
          <div>
            <label htmlFor="clubTo" className={labelClasses}>Club To:</label>
            <select
              id="clubTo"
              value={filters.clubTo}
              onChange={(e) => handleFilterChange('clubTo', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Club</option>
              {filterOptions.clubTo.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label htmlFor="month" className={labelClasses}>Month:</label>
            <select
              id="month"
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Month</option>
              {filterOptions.month.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className={labelClasses}>Year:</label>
            <select
              id="year"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className={inputClasses}
            >
              <option value="">Select Year</option>
              {filterOptions.year.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Player/Staff Transfer Report
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Show entries:
                </span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(e.target.value)}
                  className={`border rounded px-2 py-1 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <FileText className="h-4 w-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Federation</TableHead>
                <TableHead>Club From</TableHead>
                <TableHead>Player/Staff</TableHead>
                <TableHead>Club To</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferData.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{transfer.federation}</TableCell>
                  <TableCell>{transfer.clubFrom}</TableCell>
                  <TableCell>{transfer.playerStaff}</TableCell>
                  <TableCell>{transfer.clubTo}</TableCell>
                  <TableCell>{transfer.month}</TableCell>
                  <TableCell>{transfer.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PlayerTransferReport; 