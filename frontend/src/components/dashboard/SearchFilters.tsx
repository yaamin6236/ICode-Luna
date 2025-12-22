import { useState } from 'react';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

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

  const hasActiveFilters = status || startDate || endDate;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by child name, parent email..."
            className="pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} size="lg">
          <Search className="w-4 h-4" />
          Search
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-glow-pulse" />
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Card className="p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display font-semibold">Advanced Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full h-11 px-4 rounded-[10px] border-2 border-input bg-background text-sm font-display transition-all duration-300 focus:outline-none focus:border-primary/50 focus:shadow-glow-warm-sm hover:border-primary/30"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSearch} className="flex-1" size="lg">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleReset} size="lg">
                  <X className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
