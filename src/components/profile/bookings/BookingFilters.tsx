'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface BookingFiltersProps {
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: string) => void;
  onSortChange?: (sort: string) => void;
  onDateRangeChange?: (dateFrom?: string, dateTo?: string) => void;
}

export function BookingFilters({
  onSearchChange,
  onStatusChange,
  onSortChange,
  onDateRangeChange,
}: BookingFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('date-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onStatusChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange?.(value);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    onDateRangeChange?.(value, dateTo);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    onDateRangeChange?.(dateFrom, value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedSort('date-desc');
    setDateFrom('');
    setDateTo('');
    onSearchChange?.('');
    onStatusChange?.('all');
    onSortChange?.('date-desc');
    onDateRangeChange?.('', '');
  };

  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || dateFrom || dateTo;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by property name or location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="property-name">Property Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="w-full gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-semibold">Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  max={dateTo || undefined}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  min={dateFrom || undefined}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {hasActiveFilters && (
                  <>
                    <span className="font-medium text-foreground">
                      {[
                        searchTerm && 'Search',
                        selectedStatus !== 'all' && 'Status',
                        dateFrom && 'Date Range',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                    <span>filter{hasActiveFilters ? 's' : ''} active</span>
                  </>
                )}
                {!hasActiveFilters && 'No filters active'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
