'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteGearItem } from '@/lib/api';
import { GearItem as GearItemType } from '@/types/gear';
import { useToast } from '@/hooks/use-toast';

interface GearDeleteDialogProps {
  gearItem: GearItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export default function GearDeleteDialog({
  gearItem,
  open,
  onOpenChange,
  onDeleted,
}: GearDeleteDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteGearItem(gearItem.id);

      toast({
        title: 'פריט נמחק בהצלחה',
        description: `פריט "${gearItem.name}" הוסר מרשימת הציוד`,
      });

      onDeleted(gearItem.id);
    } catch (error) {
      console.error('Error deleting gear item:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה במחיקת פריט הציוד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>האם למחוק את פריט הציוד?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תמחק את &quot;{gearItem.name}&quot; וכל ההקצאות שלו.
            {gearItem.assignments.length > 0 && (
              <span className="block mt-2 text-orange-600 font-medium">
                קיימות {gearItem.assignments.length} הקצאות לפריט זה.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'מוחק...' : 'מחק'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
