'use client';

import React, { useState, useEffect } from 'react';
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
import { updateGearItem } from '@/lib/api';
import { GearItem as GearItemType, getTotalQuantityAssigned } from '@/types/gear';
import { useToast } from '@/hooks/use-toast';

interface GearEditDialogProps {
  gearItem: GearItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (gearItem: GearItemType) => void;
}

export default function GearEditDialog({
  gearItem,
  open,
  onOpenChange,
  onUpdated,
}: GearEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: gearItem.name,
    quantityNeeded: gearItem.quantityNeeded,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: gearItem.name,
        quantityNeeded: gearItem.quantityNeeded,
      });
    }
  }, [open, gearItem]);

  const totalAssigned = getTotalQuantityAssigned(gearItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם לפריט הציוד',
        variant: 'destructive',
      });
      return;
    }

    if (formData.quantityNeeded < totalAssigned) {
      toast({
        title: 'שגיאה',
        description: `לא ניתן להקטין את הכמות מתחת ל-${totalAssigned} (כמות שכבר הוקצתה)`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const updatedItem = await updateGearItem(gearItem.id, {
        name: formData.name.trim(),
        quantityNeeded: formData.quantityNeeded,
      });

      toast({
        title: 'פריט עודכן בהצלחה',
        description: `פריט "${updatedItem.name}" עודכן`,
      });

      onUpdated(updatedItem);
    } catch (error) {
      console.error('Error updating gear item:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה בעדכון פריט הציוד',
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
          <DialogTitle>ערוך פריט ציוד</DialogTitle>
          <DialogDescription>
            עדכן את פרטי פריט הציוד
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם הפריט *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="לדוגמה: אוהל משפחתי, שק שינה, מצנן"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">כמות נדרשת *</Label>
            <Input
              id="quantity"
              type="number"
              min={totalAssigned}
              value={formData.quantityNeeded}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantityNeeded: parseInt(e.target.value) || totalAssigned,
                }))
              }
              disabled={loading}
              required
            />
            {totalAssigned > 0 && (
              <p className="text-xs text-muted-foreground">
                כבר הוקצו {totalAssigned} יחידות - לא ניתן להקטין מתחת לכמות זו
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'מעדכן...' : 'עדכן'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
