'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingDashboard } from '@/components/layout/LoadingStates';
import { getTrips, getFamilyById } from '@/lib/api';
import { Calendar, Users, MapPin, Package } from 'lucide-react';
import type { Trip } from '@/types/trip';

export function FamilyDashboard({ familyId }: { familyId: string }) {
  const router = useRouter();
  const { user, family } = useAuth();
  const { refreshTriggers } = useApp();

  // Memoize fetcher functions to prevent infinite loops
  const fetchTrips = useCallback(() => getTrips({ draft: false }), []);
  const fetchFamily = useCallback(() => getFamilyById(familyId), [familyId]);

  const {
    data: trips,
    isLoading: isLoadingTrips,
    error: tripsError,
    refresh: refreshTrips,
  } = useData<Trip[]>(fetchTrips, {
    autoRefresh: true,
    refreshInterval: 60000,
  });

  const {
    data: familyData,
    isLoading: isLoadingFamily,
    error: familyError,
    refresh: refreshFamily,
  } = useData(fetchFamily, {
    autoRefresh: true,
    refreshInterval: 120000,
  });

  // Refresh when triggers change
  useEffect(() => {
    if (refreshTriggers.trips) {
      refreshTrips();
    }
  }, [refreshTriggers.trips, refreshTrips]);

  useEffect(() => {
    if (refreshTriggers.families) {
      refreshFamily();
    }
  }, [refreshTriggers.families, refreshFamily]);

  if (isLoadingTrips || isLoadingFamily) {
    return <LoadingDashboard />;
  }

  // Show error states
  if (tripsError || familyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>שגיאה בטעינת הנתונים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {tripsError?.message || familyError?.message}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                refreshTrips();
                refreshFamily();
              }}
            >
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingTrips =
    trips?.filter((trip) => new Date(trip.startDate) > new Date()) || [];
  const pastTrips =
    trips?.filter((trip) => new Date(trip.startDate) <= new Date()) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            שלום, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            ברוך הבא למערכת ניהול טיולי השכונה
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                טיולים קרובים
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingTrips.length}</div>
              <p className="text-xs text-muted-foreground">
                טיולים שתוכננו להמשך השנה
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">בני משפחה</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {familyData?.members?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                חברי משפחת {family?.name || 'שלך'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                טיולים שהשתתפתי
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastTrips.length}</div>
              <p className="text-xs text-muted-foreground">טיולים מוצלחים</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ציוד משותף</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">פריטים שהתחייבתי</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">טיולים קרובים</h2>
            <Button
              variant="outline"
              onClick={() => router.push('/family/trip')}
            >
              צפה בכל הטיולים
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    אין טיולים קרובים כרגע
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingTrips.slice(0, 3).map((trip) => (
                <Card
                  key={trip.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/family/trip/${trip.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {trip.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">תאריך:</span>
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      {trip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {trip.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Family Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">המשפחה שלי</h2>
            <Button variant="outline" onClick={() => router.push('/family')}>
              ערוך פרטי משפחה
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {familyData?.members && familyData.members.length > 0 ? (
                  familyData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.type === 'ADULT'
                            ? 'מבוגר'
                            : `ילד, גיל ${member.age || ''}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    אין חברי משפחה רשומים
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
