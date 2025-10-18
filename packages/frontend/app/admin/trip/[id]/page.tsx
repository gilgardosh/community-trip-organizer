'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  TripDetailHeader,
  TripForm,
  TripPublishControl,
  TripAdminManager,
} from '@/components/trip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getTripById, updateTrip, deleteTrip } from '@/lib/api';
import type { Trip, UpdateTripData } from '@/types/trip';

export default function AdminTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [params.id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const data = await getTripById(params.id as string);
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrip = async (data: UpdateTripData) => {
    try {
      const updatedTrip = await updateTrip(
        params.id as string,
        data as UpdateTripData,
      );
      setTrip(updatedTrip);
      setIsEditDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTrip = async () => {
    try {
      setIsDeleting(true);
      await deleteTrip(params.id as string);
      router.push('/admin/trip');
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>טוען פרטי טיול...</span>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">טיול לא נמצא</h2>
            <p className="text-muted-foreground mb-4">
              הטיול המבוקש לא קיים במערכת
            </p>
            <Button onClick={() => router.back()}>חזרה</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTripAdmin = trip.admins.some((admin) => admin.id === user?.id);
  const canEdit = isSuperAdmin || isTripAdmin;
  const canDelete = isSuperAdmin;

  return (
    <div className="min-h-screen bg-background">
      <TripDetailHeader trip={trip} onBack={() => router.back()} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {canEdit && (
          <div className="flex gap-3 justify-end mb-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 ml-2" />
              ערוך טיול
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                מחק טיול
              </Button>
            )}
          </div>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">פרטים</TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger value="admins">מנהלים</TabsTrigger>
                <TabsTrigger value="publish">פרסום</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-right">
                  <div>
                    <h3 className="font-semibold mb-2">משפחות משתתפות</h3>
                    {trip.attendees.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        אין משפחות משתתפות עדיין
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {trip.attendees.map((attendee, index) => (
                          <li
                            key={attendee.id || `attendee-${attendee.familyId}-${index}`}
                            className="text-sm border-b pb-2"
                          >
                            {attendee.family.name || 'משפחה ללא שם'} (
                            {attendee.family.members.length} חברים)
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {trip.gearItems.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">ציוד משותף</h3>
                      <ul className="space-y-2">
                        {trip.gearItems.map((gear) => (
                          <li key={gear.id} className="text-sm border-b pb-2">
                            {gear.name} - {gear.quantityNeeded} יחידות נדרשות
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <>
              <TabsContent value="admins" className="mt-6">
                <TripAdminManager trip={trip} onUpdate={fetchTrip} />
              </TabsContent>

              <TabsContent value="publish" className="mt-6">
                <TripPublishControl trip={trip} onUpdate={fetchTrip} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">עריכת טיול</DialogTitle>
          </DialogHeader>
          <TripForm
            trip={trip}
            onSubmit={handleUpdateTrip}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel="שמור שינויים"
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">מחיקת טיול</DialogTitle>
            <DialogDescription className="text-right">
              האם אתה בטוח שברצונך למחוק את הטיול &quot;{trip.name}&quot;? פעולה
              זו בלתי הפיכה.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTrip}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מוחק...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק טיול
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
