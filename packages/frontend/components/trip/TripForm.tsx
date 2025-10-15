'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import type { Trip, CreateTripData, UpdateTripData } from '@/types/trip';

const tripFormSchema = z
  .object({
    name: z.string().min(1, 'שם הטיול הוא שדה חובה'),
    location: z.string().min(1, 'מיקום הוא שדה חובה'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
    endDate: z.string().min(1, 'תאריך סיום הוא שדה חובה'),
    attendanceCutoffDate: z.string().optional(),
    photoAlbumLink: z.union([
      z.literal(''),
      z.undefined(),
      z.url('כתובת URL לא תקינה'),
    ]),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
    path: ['endDate'],
  })
  .refine(
    (data) =>
      !data.attendanceCutoffDate ||
      new Date(data.attendanceCutoffDate) <= new Date(data.startDate),
    {
      message: 'תאריך הרשמה אחרון חייב להיות לפני תאריך התחלת הטיול',
      path: ['attendanceCutoffDate'],
    },
  );

type TripFormData = z.infer<typeof tripFormSchema>;

interface TripFormProps {
  trip?: Trip;
  onSubmit: (data: CreateTripData | UpdateTripData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isEditing?: boolean;
}

export function TripForm({
  trip,
  onSubmit,
  onCancel,
  submitLabel = 'שמירה',
  isEditing = false,
}: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: trip
      ? {
          name: trip.name,
          location: trip.location,
          description: trip.description || '',
          startDate: new Date(trip.startDate).toISOString().split('T')[0],
          endDate: new Date(trip.endDate).toISOString().split('T')[0],
          attendanceCutoffDate: trip.attendanceCutoffDate
            ? new Date(trip.attendanceCutoffDate).toISOString().split('T')[0]
            : '',
          photoAlbumLink: trip.photoAlbumLink || '',
        }
      : undefined,
  });

  const onFormSubmit = async (data: TripFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const submitData: CreateTripData | UpdateTripData = {
        name: data.name,
        location: data.location,
        description: data.description || undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        attendanceCutoffDate: data.attendanceCutoffDate || undefined,
        photoAlbumLink: data.photoAlbumLink || undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת הטיול');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'עריכת טיול' : 'יצירת טיול חדש'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'ערוך את פרטי הטיול. הטיול יישאר בטיוטה עד שמנהל על יפרסם אותו.'
            : 'צור טיול חדש. הטיול ייווצר בטיוטה ויהיה זמין רק למנהלים עד שיפורסם.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              שם הטיול <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="לדוגמה: טיול לעין גדי"
              className="text-right"
            />
            {errors.name && (
              <p className="text-sm text-red-500 text-right">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-right block">
              מיקום <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="לדוגמה: עין גדי, ים המלח"
              className="text-right"
            />
            {errors.location && (
              <p className="text-sm text-red-500 text-right">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">
              תיאור
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="תאר את הטיול, פעילויות, ציוד נדרש וכו׳"
              className="text-right min-h-[120px]"
            />
            {errors.description && (
              <p className="text-sm text-red-500 text-right">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-right block">
                תאריך התחלה <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="text-right"
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 text-right">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-right block">
                תאריך סיום <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className="text-right"
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 text-right">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Attendance Cutoff Date */}
          <div className="space-y-2">
            <Label htmlFor="attendanceCutoffDate" className="text-right block">
              תאריך הרשמה אחרון
            </Label>
            <Input
              id="attendanceCutoffDate"
              type="date"
              {...register('attendanceCutoffDate')}
              className="text-right"
            />
            <p className="text-sm text-muted-foreground text-right">
              לאחר תאריך זה, משפחות לא יוכלו לשנות את סטטוס ההשתתפות שלהן
            </p>
            {errors.attendanceCutoffDate && (
              <p className="text-sm text-red-500 text-right">
                {errors.attendanceCutoffDate.message}
              </p>
            )}
          </div>

          {/* Photo Album Link */}
          <div className="space-y-2">
            <Label htmlFor="photoAlbumLink" className="text-right block">
              קישור לאלבום תמונות
            </Label>
            <Input
              id="photoAlbumLink"
              type="text"
              {...register('photoAlbumLink')}
              placeholder="https://photos.google.com/share/..."
              className="text-right"
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground text-right">
              קישור לאלבום תמונות משותף (Google Photos, Dropbox וכו׳)
            </p>
            {errors.photoAlbumLink && (
              <p className="text-sm text-red-500 text-right">
                {errors.photoAlbumLink.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
