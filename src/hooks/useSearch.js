import { useState, useEffect } from 'react';

export const useSearch = (initialData, searchKeys = ['name', 'id']) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(initialData);
      return;
    }

    const searchResults = initialData.filter(item => 
      searchKeys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );

    setFilteredData(searchResults);
  }, [searchTerm, initialData, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData
  };
}; 