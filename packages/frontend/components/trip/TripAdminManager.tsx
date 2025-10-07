'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { addTripAdmin, removeTripAdmin, getFamilies } from '@/lib/api';
import type { Trip, TripAdmin } from '@/types/trip';
import type { Family } from '@/types/family';

interface TripAdminManagerProps {
  trip: Trip;
  onUpdate?: () => void;
}

export function TripAdminManager({ trip, onUpdate }: TripAdminManagerProps) {
  const [availableAdmins, setAvailableAdmins] = useState<
    Array<{ id: string; name: string; email?: string }>
  >([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableAdmins();
  }, []);

  const fetchAvailableAdmins = async () => {
    try {
      setIsLoading(true);
      // Get all families and extract adults who can be admins
      const families = await getFamilies({ status: 'APPROVED' });

      const admins: Array<{ id: string; name: string; email?: string }> = [];

      families.forEach((family) => {
        family.members.forEach((member) => {
          if (member.type === 'ADULT') {
            admins.push({
              id: member.id,
              name: member.name,
              email: member.email,
            });
          }
        });
      });

      setAvailableAdmins(admins);
    } catch (err) {
      setError('שגיאה בטעינת רשימת המנהלים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedAdminId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      await addTripAdmin(trip.id, selectedAdminId);

      setSuccess('המנהל נוסף בהצלחה');
      setSelectedAdminId('');

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהוספת מנהל');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (trip.admins.length <= 1 && !trip.draft) {
      setError('לא ניתן להסיר את המנהל האחרון מטיול מפורסם');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      await removeTripAdmin(trip.id, adminId);

      setSuccess('המנהל הוסר בהצלחה');

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהסרת מנהל');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAdminIds = trip.admins.map((admin) => admin.id);
  const availableToAdd = availableAdmins.filter(
    (admin) => !currentAdminIds.includes(admin.id),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול מנהלי טיול</CardTitle>
        <CardDescription>
          הוסף או הסר מנהלי טיול. מנהלי טיול יכולים לערוך את פרטי הטיול ולנהל
          השתתפות משפחות.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Admins */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-right">מנהלים נוכחיים</h4>
          {trip.admins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-right">
              אין מנהלים מוקצים לטיול זה
            </p>
          ) : (
            <div className="space-y-2">
              {trip.admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="text-right">
                    <p className="font-medium">{admin.name}</p>
                    {admin.email && (
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {admin.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Admin */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium text-right">הוסף מנהל</h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : availableToAdd.length === 0 ? (
            <p className="text-sm text-muted-foreground text-right">
              כל המנהלים הזמינים כבר מוקצים לטיול
            </p>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleAddAdmin}
                disabled={!selectedAdminId || isSubmitting}
                className="w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 ml-2" />
                )}
                הוסף
              </Button>
              <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="בחר מנהל" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                      {admin.email && ` (${admin.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {!trip.draft && trip.admins.length === 1 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              זהו המנהל היחיד של טיול מפורסם. יש להוסיף מנהל נוסף לפני הסרתו.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
