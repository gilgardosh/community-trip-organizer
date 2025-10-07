import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripStatusBadge } from './TripStatusBadge';
import type { Trip } from '@/types/trip';
import { getTripStatus } from '@/types/trip';
import { MapPin, Calendar, Users } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  linkHref: string;
  showAdmins?: boolean;
}

export function TripCard({ trip, linkHref, showAdmins = false }: TripCardProps) {
  const status = getTripStatus(trip);

  return (
    <Link href={linkHref}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl">{trip.name}</CardTitle>
            <TripStatusBadge status={status} />
          </div>
          <CardDescription className="flex items-center gap-2 text-right">
            <MapPin className="w-4 h-4" />
            <span>{trip.location}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(trip.startDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' - '}
              {new Date(trip.endDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {trip.description && (
            <p className="text-sm text-foreground line-clamp-2 text-right">
              {trip.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{trip.attendees.length} משפחות</span>
            </div>

            {showAdmins && trip.admins.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {trip.admins.map((admin) => (
                  <Badge key={admin.id} variant="outline" className="text-xs">
                    {admin.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {trip.attendanceCutoffDate && status === 'upcoming' && (
            <div className="text-xs text-orange-600 text-right pt-2 border-t">
              תאריך הרשמה אחרון:{' '}
              {new Date(trip.attendanceCutoffDate).toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'long',
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
