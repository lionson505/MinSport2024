import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export function FederationFilters({ searchTerm, onSearchChange, entriesPerPage, onEntriesChange }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show entries:</span>
          <select
            className="border rounded px-2 py-1"
            value={entriesPerPage}
            onChange={(e) => onEntriesChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search federations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
} 