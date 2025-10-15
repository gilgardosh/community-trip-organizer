'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { assignGear, removeGearAssignment } from '@/lib/api';
import {
  GearItem as GearItemType,
  getFamilyAssignment,
  getRemainingQuantity,
} from '@/types/gear';
import { useToast } from '@/hooks/use-toast';

interface GearVolunteerDialogProps {
  gearItem: GearItemType;
  familyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (gearItem: GearItemType) => void;
}

export default function GearVolunteerDialog({
  gearItem,
  familyId,
  open,
  onOpenChange,
  onUpdated,
}: GearVolunteerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const existingAssignment = getFamilyAssignment(gearItem, familyId);
  const remaining = getRemainingQuantity(gearItem);
  const maxQuantity = existingAssignment
    ? existingAssignment.quantityAssigned + remaining
    : remaining;

  const [quantity, setQuantity] = useState(
    existingAssignment?.quantityAssigned || 1,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity < 1) {
      toast({
        title: 'שגיאה',
        description: 'הכמות חייבת להיות לפחות 1',
        variant: 'destructive',
      });
      return;
    }

    if (!existingAssignment && quantity > remaining) {
      toast({
        title: 'שגיאה',
        description: `ניתן להתנדב עד ${remaining} יחידות בלבד`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // If already assigned, we need to remove and re-add with new quantity
      // In a real implementation, you might want a dedicated update endpoint
      if (existingAssignment) {
        await removeGearAssignment(gearItem.id, familyId);
      }

      const result = await assignGear(gearItem.id, {
        familyId,
        quantityAssigned: quantity,
      });

      toast({
        title: 'התנדבות נשמרה',
        description: `התנדבת ל-${quantity} יחידות של "${gearItem.name}"`,
      });

      // Reload the gear item to get updated assignments
      onUpdated(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Error volunteering for gear:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה בשמירת ההתנדבות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!existingAssignment) return;

    try {
      setLoading(true);
      await removeGearAssignment(gearItem.id, familyId);

      toast({
        title: 'ההתנדבות בוטלה',
        description: `בוטלה ההתנדבות ל-"${gearItem.name}"`,
      });

      onOpenChange(false);
      // Trigger a reload by passing a modified version
      const updated = {
        ...gearItem,
        assignments: gearItem.assignments.filter(
          (a) => a.familyId !== familyId,
        ),
      };
      onUpdated(updated);
    } catch (error) {
      console.error('Error removing gear assignment:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה בביטול ההתנדבות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {existingAssignment ? 'עדכן התנדבות' : 'התנדב לציוד'}
          </DialogTitle>
          <DialogDescription>
            {gearItem.name}
            <br />
            <span className="text-sm">
              נדרש: {gearItem.quantityNeeded} | נותר: {remaining}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">כמות להתנדבות</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              {existingAssignment
                ? `כרגע התנדבת ל-${existingAssignment.quantityAssigned} יחידות`
                : `ניתן להתנדב עד ${maxQuantity} יחידות`}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            {existingAssignment && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={loading}
              >
                בטל התנדבות
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : existingAssignment ? 'עדכן' : 'התנדב'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
