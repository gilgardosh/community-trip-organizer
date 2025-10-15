'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

export interface TripFilterValues {
  search?: string;
  status?: 'all' | 'upcoming' | 'active' | 'past' | 'draft';
  startDateFrom?: Date;
  startDateTo?: Date;
}

interface TripFiltersProps {
  onFilterChange: (filters: TripFilterValues) => void;
  showDraftFilter?: boolean;
}

export function TripFilters({
  onFilterChange,
  showDraftFilter = false,
}: TripFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TripFilterValues['status']>('all');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      status,
      startDateFrom: startDateFrom ? new Date(startDateFrom) : undefined,
      startDateTo: startDateTo ? new Date(startDateTo) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setStartDateFrom('');
    setStartDateTo('');
    onFilterChange({});
  };

  const hasActiveFilters =
    search || status !== 'all' || startDateFrom || startDateTo;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="חיפוש טיולים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters();
              }
            }}
            className="pr-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          סינון
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as TripFilterValues['status'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="כל הטיולים" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הטיולים</SelectItem>
                    <SelectItem value="upcoming">טיולים קרובים</SelectItem>
                    <SelectItem value="active">טיולים פעילים</SelectItem>
                    <SelectItem value="past">טיולים שעברו</SelectItem>
                    {showDraftFilter && (
                      <SelectItem value="draft">טיולי טיוטה</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">מתאריך</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={startDateFrom}
                  onChange={(e) => setStartDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">עד תאריך</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={startDateTo}
                  onChange={(e) => setStartDateTo(e.target.value)}
                  min={startDateFrom || undefined}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                החל סינון
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  נקה
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
