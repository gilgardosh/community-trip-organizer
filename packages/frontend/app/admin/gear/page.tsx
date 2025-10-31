'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, AlertCircle } from 'lucide-react';
import { getTrips } from '@/lib/api';
import { Trip } from '@/types/trip';
import GearList from '@/components/gear/GearList';

export default function AdminGearPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTrips = await getTrips();
        setTrips(allTrips);

        // Auto-select the first trip if available
        if (allTrips.length > 0) {
          setSelectedTripId(allTrips[0].id);
        }
      } catch (err) {
        console.error('Error loading trips:', err);
        setError('שגיאה בטעינת הטיולים');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">טוען...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card dir="rtl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6" dir="rtl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle>ניהול ציוד</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  בחר טיול
                </label>
                <Select
                  value={selectedTripId}
                  onValueChange={setSelectedTripId}
                >
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="בחר טיול" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.name} -{' '}
                        {new Date(trip.startDate).toLocaleDateString('he-IL')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {trips.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>אין טיולים זמינים</p>
                  <p className="text-sm mt-2">צור טיול חדש כדי להוסיף ציוד</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gear List */}
        {selectedTripId && (
          <GearList
            tripId={selectedTripId}
            canManage={
              user.role === 'TRIP_ADMIN' || user.role === 'SUPER_ADMIN'
            }
          />
        )}
      </div>
    </div>
  );
}
