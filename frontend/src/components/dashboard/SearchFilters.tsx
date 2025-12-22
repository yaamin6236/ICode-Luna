import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    onSearch({
      searchTerm,
      status: status || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    onSearch({});
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by child name, parent email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4 glass-effect">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="enrolled">Enrolled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

