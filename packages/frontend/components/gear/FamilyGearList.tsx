'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Hand } from 'lucide-react';
import { getGearItemsByTrip } from '@/lib/api';
import { GearItem as GearItemType, getFamilyAssignment, canAssignMore } from '@/types/gear';
import GearVolunteerDialog from './GearVolunteerDialog';
import GearStatusIndicator from './GearStatusIndicator';

interface FamilyGearListProps {
  tripId: string;
  familyId: string;
}

export default function FamilyGearList({ tripId, familyId }: FamilyGearListProps) {
  const [gearItems, setGearItems] = useState<GearItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGear, setSelectedGear] = useState<GearItemType | null>(null);

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

  const handleGearUpdated = (updatedItem: GearItemType) => {
    setGearItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    setSelectedGear(null);
  };

  if (loading) {
    return (
      <Card dir="rtl">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">טוען ציוד...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card dir="rtl">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const myAssignments = gearItems.filter((item) =>
    getFamilyAssignment(item, familyId),
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* My Volunteer Commitments */}
      {myAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hand className="h-5 w-5 text-primary" />
              ההתנדבויות שלי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAssignments.map((item) => {
                const assignment = getFamilyAssignment(item, familyId)!;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          התנדבת ל-{assignment.quantityAssigned} יחידות
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGear(item)}
                    >
                      ערוך
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Gear Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            פריטי ציוד זמינים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gearItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              אין פריטי ציוד עדיין
            </div>
          ) : (
            <div className="space-y-3">
              {gearItems.map((item) => {
                const myAssignment = getFamilyAssignment(item, familyId);
                const canVolunteer = canAssignMore(item) || !!myAssignment;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{item.name}</div>
                        <GearStatusIndicator gearItem={item} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        נדרש: {item.quantityNeeded} | הוקצה:{' '}
                        {item.assignments.reduce(
                          (sum, a) => sum + a.quantityAssigned,
                          0,
                        )}
                      </div>
                    </div>
                    <Button
                      variant={myAssignment ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGear(item)}
                      disabled={!canVolunteer && !myAssignment}
                      className="mr-3"
                    >
                      {myAssignment ? 'עדכן' : 'התנדב'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGear && (
        <GearVolunteerDialog
          gearItem={selectedGear}
          familyId={familyId}
          open={!!selectedGear}
          onOpenChange={(open) => !open && setSelectedGear(null)}
          onUpdated={handleGearUpdated}
        />
      )}
    </div>
  );
}
