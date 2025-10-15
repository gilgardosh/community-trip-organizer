'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MapPin,
  TrendingUp,
  Loader2,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getSystemSummary,
  getTripStats,
  getFamilyStats,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type {
  DashboardMetrics,
  SystemSummary,
  TripStats,
  FamilyStats,
} from '@/types/admin';

export function SystemReporting() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, summaryData, tripData, familyData] =
        await Promise.all([
          getDashboardMetrics(),
          getSystemSummary(),
          getTripStats(),
          getFamilyStats(),
        ]);

      setMetrics(metricsData);
      setSummary(summaryData);
      setTripStats(tripData);
      setFamilyStats(familyData);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת נתוני דוחות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">טוען נתונים...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              סך משפחות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {summary?.families.total || 0}
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="default" className="text-xs">
                {summary?.families.active || 0} פעיל
              </Badge>
              <Badge variant="outline" className="text-xs">
                {summary?.families.pending || 0} ממתין
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              סך משתמשים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {summary?.users.total || 0}
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {summary?.users.adults || 0} מבוגרים,{' '}
              {summary?.users.children || 0} ילדים
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              סך טיולים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {summary?.trips.total || 0}
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="default" className="text-xs">
                {summary?.trips.upcoming || 0} קרוב
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {summary?.trips.completed || 0} הושלם
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              מנהלים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {(summary?.users.tripAdmins || 0) +
                  (summary?.users.superAdmins || 0)}
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {summary?.users.superAdmins || 0} סופר אדמין,{' '}
              {summary?.users.tripAdmins || 0} מנהלי טיול
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="families" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="families">
            <Users className="h-4 w-4 ml-2" />
            סטטיסטיקת משפחות
          </TabsTrigger>
          <TabsTrigger value="trips">
            <MapPin className="h-4 w-4 ml-2" />
            סטטיסטיקת טיולים
          </TabsTrigger>
        </TabsList>

        {/* Family Statistics */}
        <TabsContent value="families" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>נתוני משפחות</CardTitle>
              <CardDescription>
                סטטיסטיקות מפורטות על משפחות במערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    ממוצע חברים למשפחה
                  </div>
                  <div className="text-2xl font-bold">
                    {familyStats?.averageMembersPerFamily.toFixed(1) || '0'}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    סך כל החברים
                  </div>
                  <div className="text-2xl font-bold">
                    {familyStats?.totalMembers || 0}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    משפחות חדשות החודש
                  </div>
                  <div className="text-2xl font-bold">
                    {familyStats?.newFamiliesThisMonth || 0}
                  </div>
                </div>
              </div>

              {/* Family Growth Chart */}
              {familyStats?.familyGrowth &&
                familyStats.familyGrowth.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      גידול משפחות לפי חודש
                    </h4>
                    <div className="space-y-2">
                      {familyStats.familyGrowth.map((item) => (
                        <div
                          key={item.month}
                          className="flex items-center gap-3"
                        >
                          <div className="w-24 text-sm text-muted-foreground">
                            {item.month}
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-primary h-full flex items-center justify-end px-2"
                              style={{
                                width: `${(item.count / (familyStats.totalFamilies || 1)) * 100}%`,
                              }}
                            >
                              <span className="text-xs text-primary-foreground font-medium">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trip Statistics */}
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>נתוני טיולים</CardTitle>
              <CardDescription>
                סטטיסטיקות מפורטות על טיולים במערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    ממוצע משתתפים לטיול
                  </div>
                  <div className="text-2xl font-bold">
                    {tripStats?.averageAttendees.toFixed(1) || '0'}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    יעד פופולרי ביותר
                  </div>
                  <div className="text-xl font-bold truncate">
                    {tripStats?.mostPopularLocation || 'לא זמין'}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    טיולים קרובים
                  </div>
                  <div className="text-2xl font-bold">
                    {tripStats?.upcomingTrips || 0}
                  </div>
                </div>
              </div>

              {/* Trips by Month Chart */}
              {tripStats?.tripsByMonth && tripStats.tripsByMonth.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    טיולים לפי חודש
                  </h4>
                  <div className="space-y-2">
                    {tripStats.tripsByMonth.map((item) => (
                      <div key={item.month} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">
                          {item.month}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-secondary h-full flex items-center justify-end px-2"
                            style={{
                              width: `${(item.count / (tripStats.totalTrips || 1)) * 100}%`,
                            }}
                          >
                            <span className="text-xs text-secondary-foreground font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
