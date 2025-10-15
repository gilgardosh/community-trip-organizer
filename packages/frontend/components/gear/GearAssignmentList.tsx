'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { GearAssignment } from '@/types/gear';

interface GearAssignmentListProps {
  assignments: GearAssignment[];
  compact?: boolean;
}

export default function GearAssignmentList({
  assignments,
  compact = false,
}: GearAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        אין משפחות שהתנדבו עדיין
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {assignments.map((assignment) => {
        const familyName =
          assignment.family.name ||
          assignment.family.members.find((m) => m.type === 'adult')?.name ||
          'משפחה ללא שם';

        return (
          <div
            key={assignment.id}
            className={`flex items-center justify-between ${
              compact ? 'text-xs' : 'text-sm'
            } p-2 bg-muted/50 rounded`}
          >
            <div className="flex items-center gap-2">
              <Users
                className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`}
              />
              <span className="font-medium">{familyName}</span>
            </div>
            <span className="text-muted-foreground">
              {assignment.quantityAssigned} יח&apos;
            </span>
          </div>
        );
      })}
    </div>
  );
}
