'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { publishTrip, unpublishTrip } from '@/lib/api';
import type { Trip } from '@/types/trip';

interface TripPublishControlProps {
  trip: Trip;
  onUpdate?: () => void;
}

export function TripPublishControl({ trip, onUpdate }: TripPublishControlProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canPublish = trip.draft && trip.admins.length > 0;
  const canUnpublish = !trip.draft;

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      await publishTrip(trip.id);

      setSuccess('הטיול פורסם בהצלחה! המשפחות יכולות כעת להירשם.');
      setDialogOpen(false);

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בפרסום הטיול');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      await unpublishTrip(trip.id);

      setSuccess('הטיול הוחזר לטיוטה. המשפחות לא יכולות יותר לראות אותו.');
      setDialogOpen(false);

      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהסרת הפרסום');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>סטטוס פרסום</CardTitle>
        <CardDescription>
          {trip.draft
            ? 'הטיול נמצא בטיוטה ואינו נראה למשפחות'
            : 'הטיול פורסם והוא נראה לכל המשפחות'}
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

        {trip.draft && trip.admins.length === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              לא ניתן לפרסם טיול ללא מנהלים. הוסף לפחות מנהל אחד לפני הפרסום.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {trip.draft ? (
              <FileText className="w-5 h-5 text-gray-500" />
            ) : (
              <Upload className="w-5 h-5 text-green-600" />
            )}
            <div className="text-right">
              <p className="font-medium">
                {trip.draft ? 'טיוטה' : 'פורסם'}
              </p>
              <p className="text-sm text-muted-foreground">
                {trip.draft
                  ? 'נראה רק למנהלים'
                  : 'נראה לכל המשפחות'}
              </p>
            </div>
          </div>

          {trip.draft ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canPublish}>
                  <Upload className="w-4 h-4 ml-2" />
                  פרסם טיול
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-right">פרסום טיול</DialogTitle>
                  <DialogDescription className="text-right">
                    האם אתה בטוח שברצונך לפרסם את הטיול? לאחר הפרסום, המשפחות
                    יוכלו לראות את הטיול ולהירשם אליו.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-right">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      פרטי הטיול:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>שם: {trip.name}</li>
                      <li>מיקום: {trip.location}</li>
                      <li>
                        תאריכים:{' '}
                        {new Date(trip.startDate).toLocaleDateString('he-IL')} -{' '}
                        {new Date(trip.endDate).toLocaleDateString('he-IL')}
                      </li>
                      <li>מנהלים: {trip.admins.length}</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    ביטול
                  </Button>
                  <Button onClick={handlePublish} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        מפרסם...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        פרסם טיול
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="w-4 h-4 ml-2" />
                  החזר לטיוטה
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-right">
                    החזרה לטיוטה
                  </DialogTitle>
                  <DialogDescription className="text-right">
                    האם אתה בטוח שברצונך להחזיר את הטיול לטיוטה? המשפחות לא יוכלו
                    יותר לראות את הטיול או להירשם אליו.
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    פעולה זו תסתיר את הטיול מכל המשפחות. רישומי משפחות קיימים
                    יישארו שמורים.
                  </AlertDescription>
                </Alert>
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    ביטול
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleUnpublish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        מסיר...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 ml-2" />
                        החזר לטיוטה
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
