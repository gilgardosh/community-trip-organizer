'use client';
import { useState, useEffect } from 'react';
import { TripCard } from './TripCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import { getTrips } from '@/lib/api';
import type { Trip, TripFilters } from '@/types/trip';
import { getTripStatus } from '@/types/trip';
import type { Role } from '@/types/auth';

interface TripListProps {
  userRole: Role;
  onCreateClick?: () => void;
  baseLinkPath?: string; // e.g., '/family/trip' or '/admin/trip'
  showAdmins?: boolean;
}

export function TripList({
  userRole,
  onCreateClick,
  baseLinkPath = '/family/trip',
  showAdmins = false,
}: TripListProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, statusFilter, dateFilter]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const filters: TripFilters = {};

      // Role-based filtering
      if (userRole === 'FAMILY') {
        filters.draft = false;
      }

      const data = await getTrips(filters);
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = [...trips];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.name.toLowerCase().includes(query) ||
          trip.location.toLowerCase().includes(query) ||
          trip.description?.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (trip) => getTripStatus(trip) === statusFilter,
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter((trip) => new Date(trip.startDate) >= now);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter((trip) => new Date(trip.endDate) < now);
    } else if (dateFilter === 'active') {
      filtered = filtered.filter(
        (trip) =>
          new Date(trip.startDate) <= now && new Date(trip.endDate) >= now,
      );
    }

    setFilteredTrips(filtered);
  };

  const canCreateTrips =
    userRole === 'TRIP_ADMIN' || userRole === 'SUPER_ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="mr-2">טוען טיולים...</span>
      </div>
    );
  }

  const upcomingTrips = filteredTrips.filter(
    (trip) => getTripStatus(trip) === 'upcoming',
  );
  const activeTrips = filteredTrips.filter(
    (trip) => getTripStatus(trip) === 'active',
  );
  const pastTrips = filteredTrips.filter(
    (trip) => getTripStatus(trip) === 'past',
  );
  const draftTrips = filteredTrips.filter(
    (trip) => getTripStatus(trip) === 'draft',
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">טיולים</h1>
          <p className="text-muted-foreground">
            {filteredTrips.length} טיולים{' '}
            {searchQuery && `מתוך ${trips.length}`}
          </p>
        </div>
        {canCreateTrips && onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 ml-2" />
            טיול חדש
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-right block">
                חיפוש
              </Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="שם טיול, מיקום..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-right block">
                סטטוס
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  {userRole !== 'FAMILY' && (
                    <SelectItem value="draft">טיוטות</SelectItem>
                  )}
                  <SelectItem value="upcoming">קרובים</SelectItem>
                  <SelectItem value="active">פעילים</SelectItem>
                  <SelectItem value="past">הסתיימו</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-right block">
                תאריכים
              </Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="upcoming">עתידיים</SelectItem>
                  <SelectItem value="active">מתקיימים כעת</SelectItem>
                  <SelectItem value="past">עברו</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for organizing trips */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {userRole !== 'FAMILY' && (
            <TabsTrigger value="draft">
              טיוטות ({draftTrips.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="upcoming">
            קרובים ({upcomingTrips.length})
          </TabsTrigger>
          <TabsTrigger value="active">פעילים ({activeTrips.length})</TabsTrigger>
          <TabsTrigger value="past">הסתיימו ({pastTrips.length})</TabsTrigger>
        </TabsList>

        {userRole !== 'FAMILY' && (
          <TabsContent value="draft" className="space-y-4">
            {draftTrips.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">אין טיוטות</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    linkHref={`${baseLinkPath}/${trip.id}`}
                    showAdmins={showAdmins}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">אין טיולים קרובים</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  linkHref={`${baseLinkPath}/${trip.id}`}
                  showAdmins={showAdmins}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeTrips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">אין טיולים פעילים</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  linkHref={`${baseLinkPath}/${trip.id}`}
                  showAdmins={showAdmins}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastTrips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">אין טיולים שהסתיימו</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  linkHref={`${baseLinkPath}/${trip.id}`}
                  showAdmins={showAdmins}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
