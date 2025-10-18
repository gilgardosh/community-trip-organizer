'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FamilyDashboard } from '@/components/dashboard';

export default function FamilyPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN']}>
      {user?.familyId && <FamilyDashboard familyId={user.familyId} />}
    </ProtectedRoute>
  );
}
