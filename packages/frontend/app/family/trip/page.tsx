'use client';
import { TripList } from '@/components/trip';
import { useAuth } from '@/contexts/AuthContext';

export default function FamilyTripsPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TripList
          userRole={user.role}
          baseLinkPath="/family/trip"
          showAdmins={false}
        />
      </div>
    </div>
  );
}
