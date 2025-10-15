'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, UserPlus, X, Shield, MapPin, Calendar } from 'lucide-react';
import {
  getAllUsers,
  adminAssignTripAdmins,
  adminAddTripAdmin,
  adminRemoveTripAdmin,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { AdminUser } from '@/types/admin';
import type { Trip } from '@/types/trip';

interface TripAdminAssignmentProps {
  trip: Trip;
  onUpdate: () => void;
}

export function TripAdminAssignment({
  trip,
  onUpdate,
}: TripAdminAssignmentProps) {
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (dialogOpen) {
      loadUsers();
    }
  }, [dialogOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      // Filter only adults who can be trip admins
      const eligibleUsers = users.filter(
        (u) =>
          u.type === 'adult' &&
          (u.role === 'TRIP_ADMIN' || u.role === 'SUPER_ADMIN'),
      );
      setAllUsers(eligibleUsers);

      // Pre-select current trip admins
      const currentAdminIds = new Set(trip.admins.map((a) => a.id));
      setSelectedAdmins(currentAdminIds);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת משתמשים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmins = async () => {
    try {
      setProcessing(true);
      await adminAssignTripAdmins(trip.id, Array.from(selectedAdmins));

      toast({
        title: 'הצלחה',
        description: 'מנהלי הטיול עודכנו בהצלחה',
      });

      setDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בעדכון מנהלי הטיול',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      setRemovingAdmin(adminId);
      await adminRemoveTripAdmin(trip.id, adminId);

      toast({
        title: 'הצלחה',
        description: 'מנהל הטיול הוסר בהצלחה',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בהסרת מנהל הטיול',
        variant: 'destructive',
      });
    } finally {
      setRemovingAdmin(null);
    }
  };

  const toggleAdminSelection = (adminId: string) => {
    const newSelection = new Set(selectedAdmins);
    if (newSelection.has(adminId)) {
      newSelection.delete(adminId);
    } else {
      newSelection.add(adminId);
    }
    setSelectedAdmins(newSelection);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>מנהלי טיול</CardTitle>
              <CardDescription>
                נהל את מנהלי הטיול עבור {trip.name}
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              שייך מנהלים
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Trip Info */}
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{trip.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(trip.startDate)}
              </div>
              {trip.draft && <Badge variant="outline">טיוטה</Badge>}
            </div>
          </div>

          {/* Current Admins */}
          {trip.admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>לא משויכים מנהלי טיול</p>
              <p className="text-sm mt-1">לחץ על "שייך מנהלים" כדי להוסיף</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trip.admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{admin.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {admin.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={removingAdmin === admin.id}
                  >
                    {removingAdmin === admin.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>שיוך מנהלי טיול</DialogTitle>
            <DialogDescription>
              בחר את המשתמשים שישמשו כמנהלי טיול עבור {trip.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="mr-2">טוען משתמשים...</span>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>לא נמצאו משתמשים זכאים</p>
                <p className="text-sm mt-1">
                  רק משתמשים בתפקיד "מנהל טיול" או "סופר אדמין" יכולים להיות
                  מנהלי טיול
                </p>
              </div>
            ) : (
              allUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleAdminSelection(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAdmins.has(user.id)}
                      onCheckedChange={() => toggleAdminSelection(user.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePhotoUrl} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'
                    }
                  >
                    {user.role === 'SUPER_ADMIN' ? 'סופר אדמין' : 'מנהל טיול'}
                  </Badge>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleAssignAdmins} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  משייך...
                </>
              ) : (
                <>שייך {selectedAdmins.size} מנהלים</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
