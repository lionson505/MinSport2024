import { useState, useEffect } from 'react';

export const useFilter = (initialData, filterConfig = {}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    let result = initialData;

    // Apply each active filter
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          // Handle multi-select filters
          result = result.filter(item => value.includes(item[key]));
        } else {
          // Handle single-select filters
          result = result.filter(item => item[key] === value);
        }
      }
    });

    setFilteredData(result);
  }, [activeFilters, initialData]);

  const applyFilter = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilter = (filterName) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterName];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  return {
    filteredData,
    activeFilters,
    applyFilter,
    clearFilter,
    clearAllFilters
  };
}; 