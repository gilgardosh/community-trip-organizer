'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, PackageSearch } from 'lucide-react';
import { getGearItemsByTrip } from '@/lib/api';
import { GearItem as GearItemType } from '@/types/gear';
import GearItem from './GearItem';
import GearCreateDialog from './GearCreateDialog';
import GearStatusIndicator from './GearStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';

interface GearListProps {
  tripId: string;
  canManage?: boolean;
}

export default function GearList({ tripId, canManage = false }: GearListProps) {
  const { user } = useAuth();
  const [gearItems, setGearItems] = useState<GearItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const loadGearItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getGearItemsByTrip(tripId);
      setGearItems(items);
    } catch (err) {
      console.error('Error loading gear items:', err);
      setError('שגיאה בטעינת פריטי הציוד');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGearItems();
  }, [tripId]);

  const handleGearCreated = (newItem: GearItemType) => {
    setGearItems((prev) => [...prev, newItem]);
    setIsCreateDialogOpen(false);
  };

  const handleGearUpdated = (updatedItem: GearItemType) => {
    setGearItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
  };

  const handleGearDeleted = (deletedId: string) => {
    setGearItems((prev) => prev.filter((item) => item.id !== deletedId));
  };

  if (loading) {
    return (
      <Card className="w-full" dir="rtl">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">טוען ציוד...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" dir="rtl">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">{error}</div>
          <div className="text-center mt-4">
            <Button onClick={loadGearItems} variant="outline">
              נסה שוב
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageSearch className="h-6 w-6 text-primary" />
              <CardTitle>רשימת ציוד</CardTitle>
            </div>
            {canManage && (
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 ml-2" />
                הוסף פריט
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {gearItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageSearch className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>אין פריטי ציוד עדיין</p>
              {canManage && (
                <p className="text-sm mt-2">לחץ על &quot;הוסף פריט&quot; כדי להתחיל</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {gearItems.map((item) => (
                <GearItem
                  key={item.id}
                  gearItem={item}
                  canManage={canManage}
                  onUpdate={handleGearUpdated}
                  onDelete={handleGearDeleted}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <GearCreateDialog
          tripId={tripId}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreated={handleGearCreated}
        />
      )}
    </div>
  );
}
