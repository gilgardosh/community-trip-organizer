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
import { createGearItem } from '@/lib/api';
import { GearItem as GearItemType } from '@/types/gear';
import { useToast } from '@/hooks/use-toast';

interface GearCreateDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (gearItem: GearItemType) => void;
}

export default function GearCreateDialog({
  tripId,
  open,
  onOpenChange,
  onCreated,
}: GearCreateDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantityNeeded: 1,
  });

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

    if (formData.quantityNeeded < 1) {
      toast({
        title: 'שגיאה',
        description: 'הכמות חייבת להיות לפחות 1',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const newItem = await createGearItem({
        tripId,
        name: formData.name.trim(),
        quantityNeeded: formData.quantityNeeded,
      });

      toast({
        title: 'פריט נוצר בהצלחה',
        description: `פריט "${newItem.name}" נוסף לרשימת הציוד`,
      });

      onCreated(newItem);
      setFormData({ name: '', quantityNeeded: 1 });
    } catch (error) {
      console.error('Error creating gear item:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה ביצירת פריט הציוד',
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
          <DialogTitle>הוסף פריט ציוד</DialogTitle>
          <DialogDescription>
            הוסף פריט ציוד חדש לרשימת הטיול. משפחות יוכלו להתנדב לספק את הפריטים.
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
              min="1"
              value={formData.quantityNeeded}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantityNeeded: parseInt(e.target.value) || 1,
                }))
              }
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              כמה יחידות מהפריט הזה נדרשות לטיול
            </p>
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
              {loading ? 'יוצר...' : 'צור פריט'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
