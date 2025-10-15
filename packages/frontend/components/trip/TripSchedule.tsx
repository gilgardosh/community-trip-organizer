'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';
import type { TripScheduleItem } from '@/types/trip';

interface TripScheduleProps {
  scheduleItems: TripScheduleItem[];
  tripStartDate: string;
}

export function TripSchedule({
  scheduleItems,
  tripStartDate,
}: TripScheduleProps) {
  // Group schedule items by day
  const scheduleByDay = scheduleItems.reduce(
    (acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    },
    {} as Record<number, TripScheduleItem[]>,
  );

  const getDayDate = (day: number) => {
    const date = new Date(tripStartDate);
    date.setDate(date.getDate() + (day - 1));
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (scheduleItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            לוח זמנים
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>טרם נוסף לוח זמנים לטיול זה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          לוח זמנים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(scheduleByDay)
          .sort((a, b) => Number(a) - Number(b))
          .map((day) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Badge variant="outline">יום {day}</Badge>
                <span className="text-sm text-muted-foreground">
                  {getDayDate(Number(day))}
                </span>
              </div>

              <div className="space-y-3">
                {scheduleByDay[Number(day)].map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {item.startTime}
                            {item.endTime && ` - ${item.endTime}`}
                          </span>
                        </div>

                        <h4 className="font-semibold text-foreground">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
