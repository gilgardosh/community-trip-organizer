'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Edit, Trash2, Users } from 'lucide-react';
import { GearItem as GearItemType, getTotalQuantityAssigned, getRemainingQuantity } from '@/types/gear';
import GearStatusIndicator from './GearStatusIndicator';
import GearEditDialog from './GearEditDialog';
import GearDeleteDialog from './GearDeleteDialog';
import GearAssignmentList from './GearAssignmentList';
import { cn } from '@/lib/utils';

interface GearItemProps {
  gearItem: GearItemType;
  canManage?: boolean;
  onUpdate?: (updatedItem: GearItemType) => void;
  onDelete?: (deletedId: string) => void;
}

export default function GearItem({
  gearItem,
  canManage = false,
  onUpdate,
  onDelete,
}: GearItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);

  const totalAssigned = getTotalQuantityAssigned(gearItem);
  const remaining = getRemainingQuantity(gearItem);

  return (
    <>
      <Card className="p-4" dir="rtl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Package className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{gearItem.name}</h3>
                <GearStatusIndicator gearItem={gearItem} />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  נדרש: <strong className="text-foreground">{gearItem.quantityNeeded}</strong>
                </span>
                <span className="text-muted-foreground">|</span>
                <span>
                  הוקצה: <strong className="text-foreground">{totalAssigned}</strong>
                </span>
                {remaining > 0 && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-orange-600">
                      חסר: <strong>{remaining}</strong>
                    </span>
                  </>
                )}
              </div>

              {gearItem.assignments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssignments(!showAssignments)}
                  className="text-xs h-7 px-2"
                >
                  <Users className="h-3 w-3 ml-1" />
                  {showAssignments ? 'הסתר משפחות' : `הצג משפחות (${gearItem.assignments.length})`}
                </Button>
              )}

              {showAssignments && gearItem.assignments.length > 0 && (
                <div className="pt-2 border-t">
                  <GearAssignmentList assignments={gearItem.assignments} />
                </div>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {canManage && (
        <>
          <GearEditDialog
            gearItem={gearItem}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onUpdated={(updated: GearItemType) => {
              onUpdate?.(updated);
              setIsEditDialogOpen(false);
            }}
          />
          <GearDeleteDialog
            gearItem={gearItem}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDeleted={(id: string) => {
              onDelete?.(id);
              setIsDeleteDialogOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}
