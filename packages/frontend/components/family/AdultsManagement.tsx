'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
} from '@/lib/api';
import { addMemberSchema, updateMemberSchema } from '@/lib/validation';
import type { FamilyMember } from '@/types/family';
import { UserPlus, Edit, Trash2, Mail, Save, X } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import Image from 'next/image';

interface AdultsManagementProps {
  familyId: string;
  adults: FamilyMember[];
  onUpdate?: () => void;
}

export default function AdultsManagement({
  familyId,
  adults,
  onUpdate,
}: AdultsManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdult, setEditingAdult] = useState<FamilyMember | null>(null);
  const [deletingAdult, setDeletingAdult] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Add adult form state
  const [newAdult, setNewAdult] = useState({
    name: '',
    email: '',
    password: '',
    profilePhotoUrl: '',
  });

  // Edit adult form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    profilePhotoUrl: '',
  });

  const resetAddForm = () => {
    setNewAdult({
      name: '',
      email: '',
      password: '',
      profilePhotoUrl: '',
    });
    setErrors({});
    setGeneralError('');
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      email: '',
      profilePhotoUrl: '',
    });
    setErrors({});
    setGeneralError('');
  };

  const handleAddAdult = async () => {
    setErrors({});
    setGeneralError('');
    setIsLoading(true);

    try {
      const formData = {
        type: 'ADULT' as const,
        name: newAdult.name,
        email: newAdult.email,
        password: newAdult.password,
        profilePhotoUrl: newAdult.profilePhotoUrl || undefined,
      };

      addMemberSchema.parse(formData);

      // Hash password
      const passwordHash = await bcrypt.hash(formData.password!, 10);

      await addFamilyMember(familyId, {
        ...formData,
        password: passwordHash,
      });

      setIsAddDialogOpen(false);
      resetAddForm();
      onUpdate?.();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          zodErrors[path] = err.message;
        });
        setErrors(zodErrors);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'אירעה שגיאה בעת הוספת המבוגר';
        setGeneralError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdult = async () => {
    if (!editingAdult) return;

    setErrors({});
    setGeneralError('');
    setIsLoading(true);

    try {
      const formData = {
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        profilePhotoUrl: editForm.profilePhotoUrl || undefined,
      };

      updateMemberSchema.parse(formData);

      await updateFamilyMember(familyId, editingAdult.id, formData);

      setEditingAdult(null);
      resetEditForm();
      onUpdate?.();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          zodErrors[path] = err.message;
        });
        setErrors(zodErrors);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'אירעה שגיאה בעת עדכון המבוגר';
        setGeneralError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdult = async () => {
    if (!deletingAdult) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      await removeFamilyMember(familyId, deletingAdult.id);
      setDeletingAdult(null);
      onUpdate?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'אירעה שגיאה בעת מחיקת המבוגר';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (adult: FamilyMember) => {
    setEditingAdult(adult);
    setEditForm({
      name: adult.name,
      email: adult.email,
      profilePhotoUrl: adult.profilePhotoUrl || '',
    });
    setErrors({});
    setGeneralError('');
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            ניהול מבוגרים
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetAddForm}>
                <UserPlus className="h-4 w-4 ml-2" />
                הוסף מבוגר
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>הוספת מבוגר חדש</DialogTitle>
                <DialogDescription>
                  מלא את הפרטים של המבוגר החדש
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {generalError && (
                  <Alert variant="destructive">{generalError}</Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-adult-name">שם מלא *</Label>
                  <Input
                    id="new-adult-name"
                    value={newAdult.name}
                    onChange={(e) =>
                      setNewAdult({ ...newAdult, name: e.target.value })
                    }
                    placeholder="שם מלא"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-adult-email">דוא״ל *</Label>
                  <Input
                    id="new-adult-email"
                    type="email"
                    value={newAdult.email}
                    onChange={(e) =>
                      setNewAdult({ ...newAdult, email: e.target.value })
                    }
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-adult-password">סיסמה *</Label>
                  <Input
                    id="new-adult-password"
                    type="password"
                    value={newAdult.password}
                    onChange={(e) =>
                      setNewAdult({ ...newAdult, password: e.target.value })
                    }
                    placeholder="לפחות 8 תווים"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-adult-photo">
                    קישור לתמונה (אופציונלי)
                  </Label>
                  <Input
                    id="new-adult-photo"
                    type="url"
                    value={newAdult.profilePhotoUrl}
                    onChange={(e) =>
                      setNewAdult({
                        ...newAdult,
                        profilePhotoUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                  {errors.profilePhotoUrl && (
                    <p className="text-sm text-red-500">
                      {errors.profilePhotoUrl}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  ביטול
                </Button>
                <Button onClick={handleAddAdult} disabled={isLoading}>
                  {isLoading ? 'מוסיף...' : 'הוסף'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adults.map((adult) => (
            <div
              key={adult.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Avatar className="h-12 w-12">
                {adult.profilePhotoUrl ? (
                  <Image src={adult.profilePhotoUrl} alt={adult.name} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
                    {adult.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{adult.name}</span>
                  {adult.role !== 'FAMILY' && (
                    <Badge variant="secondary" className="text-xs">
                      {adult.role === 'SUPER_ADMIN' ? 'מנהל על' : 'מנהל טיול'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {adult.email}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(adult)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {adults.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingAdult(adult)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {adults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              לא נמצאו מבוגרים
            </p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAdult}
        onOpenChange={(open) => !open && setEditingAdult(null)}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת מבוגר</DialogTitle>
            <DialogDescription>עדכן את פרטי המבוגר</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {generalError && (
              <Alert variant="destructive">{generalError}</Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-adult-name">שם מלא</Label>
              <Input
                id="edit-adult-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="שם מלא"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-adult-email">דוא״ל</Label>
              <Input
                id="edit-adult-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-adult-photo">קישור לתמונה (אופציונלי)</Label>
              <Input
                id="edit-adult-photo"
                type="url"
                value={editForm.profilePhotoUrl}
                onChange={(e) =>
                  setEditForm({ ...editForm, profilePhotoUrl: e.target.value })
                }
                placeholder="https://..."
              />
              {errors.profilePhotoUrl && (
                <p className="text-sm text-red-500">{errors.profilePhotoUrl}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAdult(null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 ml-2" />
              ביטול
            </Button>
            <Button onClick={handleEditAdult} disabled={isLoading}>
              <Save className="h-4 w-4 ml-2" />
              {isLoading ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingAdult}
        onOpenChange={(open) => !open && setDeletingAdult(null)}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת מבוגר</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את {deletingAdult?.name}?
              {adults.length === 1 && (
                <Alert variant="destructive" className="mt-4">
                  לא ניתן למחוק את המבוגר האחרון במשפחה
                </Alert>
              )}
            </DialogDescription>
          </DialogHeader>
          {generalError && <Alert variant="destructive">{generalError}</Alert>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAdult(null)}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAdult}
              disabled={isLoading || adults.length === 1}
            >
              {isLoading ? 'מוחק...' : 'מחק'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
