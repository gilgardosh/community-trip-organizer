'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FamilyDashboard } from '@/components/family';
import { redirect } from 'next/navigation';

export default function FamilyPage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN']}>
      <FamilyDashboard familyId={user.familyId} />
    </ProtectedRoute>
  );
}
