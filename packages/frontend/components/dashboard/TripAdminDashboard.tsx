'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingDashboard } from '@/components/layout/LoadingStates';
import { getTrips, getDashboardMetrics } from '@/lib/api';
import {
  Calendar,
  Users,
  MapPin,
  Package,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import type { Trip } from '@/types/trip';
import type { DashboardMetrics } from '@/types/admin';

export function TripAdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshTriggers } = useApp();

  const {
    data: trips,
    isLoading: isLoadingTrips,
    refresh: refreshTrips,
  } = useData<Trip[]>(() => getTrips({ draft: false }), {
    autoRefresh: true,
    refreshInterval: 60000,
  });

  const { data: metrics, isLoading: isLoadingMetrics } =
    useData<DashboardMetrics>(() => getDashboardMetrics(), {
      autoRefresh: true,
      refreshInterval: 120000,
    });

  useEffect(() => {
    refreshTrips();
  }, [refreshTriggers.trips, refreshTrips]);

  if (isLoadingTrips || isLoadingMetrics) {
    return <LoadingDashboard />;
  }

  const myTrips =
    trips?.filter((trip) =>
      trip.admins?.some((admin) => admin.id === user?.id),
    ) || [];
  const upcomingTrips = myTrips.filter(
    (trip) => new Date(trip.startDate) > new Date(),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            פאנל מנהל טיולים
          </h1>
          <p className="text-muted-foreground mt-2">
            ניהול וארגון טיולים משפחתיים
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הטיולים שלי</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTrips.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingTrips.length} קרובים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">משתתפים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">בכל הטיולים</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ציוד</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalGearItems || 0}
              </div>
              <p className="text-xs text-muted-foreground">פריטי ציוד</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הודעות</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.recentActivity?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">פעילויות אחרונות</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            className="h-24 flex flex-col gap-2"
            onClick={() => router.push('/admin/trip')}
          >
            <Calendar className="h-6 w-6" />
            <span>נהל טיולים</span>
          </Button>
          <Button
            className="h-24 flex flex-col gap-2"
            variant="outline"
            onClick={() => router.push('/admin/whatsapp')}
          >
            <MessageSquare className="h-6 w-6" />
            <span>שלח הודעות</span>
          </Button>
          <Button
            className="h-24 flex flex-col gap-2"
            variant="outline"
            onClick={() => router.push('/admin/families')}
          >
            <Users className="h-6 w-6" />
            <span>רשימת משפחות</span>
          </Button>
        </div>

        {/* My Trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">הטיולים שלי</h2>
            <Button onClick={() => router.push('/admin/trip')}>
              צפה בכל הטיולים
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTrips.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    אין טיולים שהוקצו לך כרגע
                  </p>
                </CardContent>
              </Card>
            ) : (
              myTrips.slice(0, 3).map((trip) => (
                <Card
                  key={trip.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/admin/trip/${trip.id}`)}
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">משתתפים:</span>
                        <span>{trip.attendees?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {metrics?.recentActivity && metrics.recentActivity.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">פעילות אחרונה</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {metrics.recentActivity
                    .slice(0, 5)
                    .map((activity, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium">{activity.actionType}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.entityType}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString(
                            'he-IL',
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
