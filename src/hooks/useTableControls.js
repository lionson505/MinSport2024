import { useState, useEffect } from 'react';

export const useTableControls = (initialData, itemsPerPage = 10) => {
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filters
  const handleFilter = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, filters, sortConfig]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    totalItems,
    searchTerm,
    filters,
    sortConfig,
    handleSearch,
    handleSort,
    handleFilter,
    handlePageChange,
    resetFilters,
    itemsPerPage
  };
}; 