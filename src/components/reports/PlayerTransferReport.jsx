import React, { useState, useEffect } from 'react';
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
import axiosInstance from '../../utils/axiosInstance';

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
  const [transferData, setTransferData] = useState([]);
  const [federations, setFederations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    federation: [],
    clubFrom: [],
    clubTo: [],
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    year: Array.from({ length: 9 }, (_, i) => (new Date().getFullYear() - i).toString())
  });
  const [playerStaffOptions, setPlayerStaffOptions] = useState([]);

  // Fetch transfer data from API
  useEffect(() => {
    const fetchTransferData = async () => {
      try {
        const response = await axiosInstance.get('/transfers');
        setTransferData(response.data);
      } catch (error) {
        console.error('Error fetching transfer data:', error);
      }
    };

    fetchTransferData();
  }, []);

  // Fetch federations and clubs data from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [federationResponse, clubResponse] = await Promise.all([
          axiosInstance.get('/federations'),
          axiosInstance.get('/clubs')
        ]);

        setFederations(federationResponse.data);
        setClubs(clubResponse.data);
        
        // Update filter options with API data
        setFilterOptions(prev => ({
          ...prev,
          federation: federationResponse.data.map(fed => fed.name),
          clubFrom: clubResponse.data.map(club => club.name),
          clubTo: clubResponse.data.map(club => club.name),
        }));
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Add useEffect for fetching player-staff data
  useEffect(() => {
    const fetchPlayerStaff = async () => {
      try {
        const response = await axiosInstance.get('/player-staff');
        console.log('Player staff data:', response.data); // For debugging
        setPlayerStaffOptions(response.data);
      } catch (error) {
        console.error('Error fetching player-staff data:', error);
        setPlayerStaffOptions([]);
      }
    };

    fetchPlayerStaff();
  }, []);

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

  // Helper functions to get names from IDs
  const getFederationName = (federationId) => {
    const federation = federations.find(f => f.id === federationId);
    return federation ? federation.name : 'N/A';
  };

  // Add this new function to filter the data
  const getFilteredData = () => {
    return transferData.filter(transfer => {
      // Search term filter
      const searchString = (
        transfer.playerStaff?.federation?.name + ' ' +
        transfer.fromClub?.name + ' ' +
        (transfer.playerStaff ? 
          transfer.playerStaff.firstName + ' ' +
          transfer.playerStaff.lastName 
          : '') + ' ' +
        transfer.toClub?.name + ' ' +
        (transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : '')
      ).toLowerCase();

      const searchMatch = !searchTerm || searchString.includes(searchTerm.toLowerCase());

      // Filters
      const federationMatch = !filters.federation || 
        getFederationName(transfer.playerStaff?.federationId) === filters.federation;
      const clubFromMatch = !filters.clubFrom || transfer.fromClub?.name === filters.clubFrom;
      const clubToMatch = !filters.clubTo || transfer.toClub?.name === filters.clubTo;
      const playerStaffMatch = !filters.playerStaff || 
        transfer.playerStaff?.id.toString() === filters.playerStaff;

      // Date filters
      const transferDate = transfer.transferDate ? new Date(transfer.transferDate) : null;
      const monthMatch = !filters.month || 
        (transferDate && filterOptions.month[transferDate.getMonth()] === filters.month);
      const yearMatch = !filters.year || 
        (transferDate && transferDate.getFullYear().toString() === filters.year);

      return searchMatch && federationMatch && clubFromMatch && 
             clubToMatch && playerStaffMatch && monthMatch && yearMatch;
    });
  };

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
              {playerStaffOptions.map(person => (
                <option key={person.id} value={person.id}>
                  {`${person.firstName} ${person.lastName}`}
                </option>
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

        {/* Add search input to the JSX above the filters */}
        <div className="mb-4">
          <label htmlFor="search" className={labelClasses}>Search:</label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transfers..."
              className={inputClasses}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
              {getFilteredData().map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{getFederationName(transfer.playerStaff?.federationId)}</TableCell>
                  <TableCell>{transfer.fromClub?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {transfer.playerStaff 
                      ? `${transfer.playerStaff.firstName} ${transfer.playerStaff.lastName}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{transfer.playerStaff?.type || 'N/A'}</TableCell>
                  <TableCell>{transfer.toClub?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {transfer.transferDate 
                      ? new Date(transfer.transferDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </TableCell>
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
