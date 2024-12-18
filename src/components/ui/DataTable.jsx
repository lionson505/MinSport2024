import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { Search, Filter, X } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

export const DataTable = ({
  data,
  columns,
  searchKeys = ['name', 'id'],
  filterConfig = {},
  itemsPerPage = 10,
  renderRow,
  onRowSelect,
  selectedRows = [],
  actions
}) => {
  const { isDarkMode } = useDarkMode();
  const { searchTerm, setSearchTerm, filteredData: searchResults } = useSearch(data, searchKeys);
  const { filteredData, activeFilters, applyFilter, clearFilter, clearAllFilters } = useFilter(searchResults, filterConfig);
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    totalItems,
    startIndex,
    endIndex
  } = usePagination(filteredData, itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} h-5 w-5`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className={`pl-10 pr-4 py-2 border rounded-lg w-64 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <div className="flex items-center space-x-4">
          {Object.entries(filterConfig).map(([filterName, options]) => (
            <select
              key={filterName}
              value={activeFilters[filterName] || ''}
              onChange={(e) => applyFilter(filterName, e.target.value)}
              className={`border rounded-lg px-3 py-1.5 text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{filterName}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={clearAllFilters}
              className={`text-sm text-red-600 hover:text-red-700 flex items-center space-x-1 ${
                isDarkMode ? 'text-red-400 hover:text-red-300' : ''
              }`}
            >
              <X className="h-4 w-4" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white shadow'
      }`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="relative px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {paginatedData.map((item) => renderRow(item))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Showing {startIndex} to {endIndex} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded ${
              isDarkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            Previous
          </button>
          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border rounded ${
              isDarkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}; 