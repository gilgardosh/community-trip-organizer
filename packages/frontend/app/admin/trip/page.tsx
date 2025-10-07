'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripList, TripForm } from '@/components/trip';
import { useAuth } from '@/contexts/AuthContext';
import { createTrip } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreateTripData, UpdateTripData } from '@/types/trip';

export default function AdminTripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleCreateTrip = async (data: CreateTripData | UpdateTripData) => {
    try {
      const newTrip = await createTrip(data as CreateTripData);
      setIsCreateDialogOpen(false);
      router.push(`/admin/trip/${newTrip.id}`);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TripList
          userRole={user.role}
          baseLinkPath="/admin/trip"
          showAdmins={true}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right">יצירת טיול חדש</DialogTitle>
            </DialogHeader>
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setIsCreateDialogOpen(false)}
              submitLabel="צור טיול"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
