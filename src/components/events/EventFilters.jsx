import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';

export function EventFilters({ 
  searchTerm, 
  onSearchChange,
  onFilterClick,
  activeFilters = []
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button 
        variant="outline" 
        onClick={onFilterClick}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilters.length > 0 && (
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
            {activeFilters.length}
          </span>
        )}
      </Button>
    </div>
  );
} 