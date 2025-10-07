'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { markTripAttendance } from '@/lib/api';
import type { Trip } from '@/types/trip';
import { canEditAttendance } from '@/types/trip';

interface AttendanceMarkerProps {
  trip: Trip;
  familyId: string;
  isAttending: boolean;
  onUpdate?: () => void;
}

export function AttendanceMarker({
  trip,
  familyId,
  isAttending: initialAttending,
  onUpdate,
}: AttendanceMarkerProps) {
  const [isAttending, setIsAttending] = useState(initialAttending);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canEdit = canEditAttendance(trip);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      await markTripAttendance(trip.id, {
        familyId,
        attending: isAttending,
      });

      setSuccess(true);
      if (onUpdate) {
        onUpdate();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת השתתפות');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          השתתפות בטיול
        </CardTitle>
        <CardDescription>
          סמן את השתתפות המשפחה בטיול זה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canEdit && trip.attendanceCutoffDate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              תאריך הרשמה אחרון עבר (
              {new Date(trip.attendanceCutoffDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              ). לא ניתן לשנות את סטטוס ההשתתפות.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>סטטוס ההשתתפות נשמר בהצלחה!</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="attendance"
            checked={isAttending}
            onCheckedChange={(checked) => setIsAttending(checked === true)}
            disabled={!canEdit}
          />
          <Label
            htmlFor="attendance"
            className={`text-right ${!canEdit ? 'text-muted-foreground' : ''}`}
          >
            המשפחה משתתפת בטיול
          </Label>
        </div>

        {canEdit && (
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 ml-2" />
                שמירת סטטוס השתתפות
              </>
            )}
          </Button>
        )}

        {trip.attendanceCutoffDate && canEdit && (
          <p className="text-sm text-muted-foreground text-right">
            ניתן לשנות את הסטטוס עד{' '}
            {new Date(trip.attendanceCutoffDate).toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
