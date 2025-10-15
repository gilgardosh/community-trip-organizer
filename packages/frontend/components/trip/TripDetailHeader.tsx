'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TripStatusBadge } from './TripStatusBadge';
import type { Trip } from '@/types/trip';
import { getTripStatus } from '@/types/trip';
import {
  MapPin,
  Calendar,
  Users,
  Camera,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

interface TripDetailHeaderProps {
  trip: Trip;
  onBack?: () => void;
}

export function TripDetailHeader({ trip, onBack }: TripDetailHeaderProps) {
  const status = getTripStatus(trip);

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
        )}

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <TripStatusBadge status={status} />
            <h1 className="text-3xl font-bold text-foreground flex-1 text-right">
              {trip.name}
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(trip.startDate).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(trip.endDate).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {trip.attendanceCutoffDate && status === 'upcoming' && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-4 h-4" />
                <span>
                  הרשמה עד{' '}
                  {new Date(trip.attendanceCutoffDate).toLocaleDateString(
                    'he-IL',
                    {
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </span>
              </div>
            )}
          </div>

          {trip.description && (
            <p className="text-foreground leading-relaxed text-right">
              {trip.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                {trip.attendees.length} משפחות משתתפות
              </span>
            </div>

            {trip.admins.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1 justify-end">
                  {trip.admins.map((admin) => (
                    <Badge key={admin.id} variant="outline" className="text-xs">
                      <User className="w-3 h-3 ml-1" />
                      {admin.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {trip.photoAlbumLink && (
            <div className="pt-2">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => window.open(trip.photoAlbumLink, '_blank')}
              >
                <Camera className="w-4 h-4 ml-2" />
                אלבום תמונות
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
