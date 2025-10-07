'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Baby, Utensils } from 'lucide-react';
import type { TripAttendee } from '@/types/trip';

interface AttendanceSummaryProps {
  attendees: TripAttendee[];
}

export function AttendanceSummary({ attendees }: AttendanceSummaryProps) {
  // Calculate statistics
  const totalFamilies = attendees.length;
  
  const allMembers = attendees.flatMap((attendee) => attendee.family.members);
  const adults = allMembers.filter((member) => member.type === 'ADULT');
  const children = allMembers.filter((member) => member.type === 'CHILD');
  
  const familiesWithDietaryRequirements = attendees.filter(
    (attendee) => attendee.dietaryRequirements && attendee.dietaryRequirements.trim() !== ''
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          סיכום השתתפות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{totalFamilies}</div>
            <div className="text-xs text-muted-foreground">משפחות</div>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-foreground">{adults.length}</div>
            <div className="text-xs text-muted-foreground">מבוגרים</div>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <Baby className="w-6 h-6 mx-auto mb-2 text-pink-500" />
            <div className="text-2xl font-bold text-foreground">{children.length}</div>
            <div className="text-xs text-muted-foreground">ילדים</div>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <Utensils className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-foreground">
              {familiesWithDietaryRequirements.length}
            </div>
            <div className="text-xs text-muted-foreground">דרישות תזונתיות</div>
          </div>
        </div>

        {/* Families List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">משפחות משתתפות</h4>
          <div className="space-y-2">
            {attendees.map((attendee, index) => {
              const familyAdults = attendee.family.members.filter(
                (m) => m.type === 'ADULT'
              );
              const familyChildren = attendee.family.members.filter(
                (m) => m.type === 'CHILD'
              );

              return (
                <div
                  key={`attendee-${attendee.id}-${index}`}
                  className="border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {attendee.family.name || 'משפחה'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {familyAdults.length} מבוגרים
                      </Badge>
                      {familyChildren.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {familyChildren.length} ילדים
                        </Badge>
                      )}
                    </div>
                  </div>

                  {attendee.dietaryRequirements && (
                    <div className="flex items-start gap-2 text-sm bg-orange-50 dark:bg-orange-950/20 rounded p-2">
                      <Utensils className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          דרישות תזונתיות:{' '}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {attendee.dietaryRequirements}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {attendees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>אין עדיין משפחות רשומות לטיול</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
