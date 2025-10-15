'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  UserX,
  UserCheck,
} from 'lucide-react';
import {
  adminDeactivateFamily,
  adminReactivateFamily,
  adminDeleteFamily,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Family } from '@/types/family';

interface FamilyDeactivationControlsProps {
  family: Family;
  onUpdate: () => void;
}

export function FamilyDeactivationControls({
  family,
  onUpdate,
}: FamilyDeactivationControlsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'deactivate' | 'reactivate' | 'delete';
  }>({ open: false, action: 'deactivate' });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleDeactivate = async () => {
    try {
      setProcessing(true);
      await adminDeactivateFamily(family.id);

      toast({
        title: 'הצלחה',
        description: 'המשפחה הושבתה בהצלחה',
      });

      setConfirmDialog({ ...confirmDialog, open: false });
      onUpdate();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בהשבתת המשפחה',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setProcessing(true);
      await adminReactivateFamily(family.id);

      toast({
        title: 'הצלחה',
        description: 'המשפחה הופעלה מחדש בהצלחה',
      });

      setConfirmDialog({ ...confirmDialog, open: false });
      onUpdate();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בהפעלת המשפחה מחדש',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await adminDeleteFamily(family.id);

      toast({
        title: 'הצלחה',
        description: 'המשפחה נמחקה לצמיתות',
      });

      setConfirmDialog({ ...confirmDialog, open: false });
      onUpdate();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל במחיקת המשפחה',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>בקרות משפחה</CardTitle>
          <CardDescription>נהל את מצב המשפחה במערכת</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Family Status */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">סטטוס נוכחי:</span>
              <Badge variant={family.isActive ? 'default' : 'destructive'}>
                {family.isActive ? 'פעיל' : 'מושבת'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">סטטוס אישור:</span>
              <Badge
                variant={family.status === 'APPROVED' ? 'default' : 'outline'}
              >
                {family.status === 'APPROVED' ? 'מאושר' : 'ממתין'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {family.isActive ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setConfirmDialog({ open: true, action: 'deactivate' })
                }
              >
                <UserX className="h-4 w-4 ml-2" />
                השבת משפחה
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setConfirmDialog({ open: true, action: 'reactivate' })
                }
              >
                <UserCheck className="h-4 w-4 ml-2" />
                הפעל מחדש
              </Button>
            )}

            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground mb-3">
                <AlertTriangle className="h-4 w-4 inline ml-1" />
                אזור מסוכן - פעולות בלתי הפיכות
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  setConfirmDialog({ open: true, action: 'delete' })
                }
              >
                מחק משפחה לצמיתות
              </Button>
            </div>
          </div>

          {/* Warning Messages */}
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>שים לב:</strong> השבתת משפחה תמנע מהחברים שלה להתחבר
              למערכת ולהשתתף בטיולים. הנתונים ההיסטוריים יישמרו.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>אזהרה:</strong> מחיקת משפחה היא פעולה בלתי הפיכה. כל
              הנתונים ההיסטוריים יישמרו למטרות רישום, אך החברים לא יוכלו להתחבר
              למערכת.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'deactivate' && 'השבתת משפחה'}
              {confirmDialog.action === 'reactivate' && 'הפעלת משפחה מחדש'}
              {confirmDialog.action === 'delete' && 'מחיקת משפחה לצמיתות'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'deactivate' &&
                `האם אתה בטוח שברצונך להשבית את ${family.name || 'משפחה זו'}? החברים לא יוכלו להתחבר למערכת.`}
              {confirmDialog.action === 'reactivate' &&
                `האם אתה בטוח שברצונך להפעיל מחדש את ${family.name || 'משפחה זו'}? החברים יוכלו להתחבר שוב למערכת.`}
              {confirmDialog.action === 'delete' &&
                `האם אתה בטוח לחלוטין שברצונך למחוק את ${family.name || 'משפחה זו'} לצמיתות? פעולה זו לא ניתנת לביטול!`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              disabled={processing}
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                if (confirmDialog.action === 'deactivate') {
                  handleDeactivate();
                } else if (confirmDialog.action === 'reactivate') {
                  handleReactivate();
                } else if (confirmDialog.action === 'delete') {
                  handleDelete();
                }
              }}
              variant={
                confirmDialog.action === 'delete' ? 'destructive' : 'default'
              }
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  מעבד...
                </>
              ) : (
                <>
                  {confirmDialog.action === 'deactivate' && 'השבת'}
                  {confirmDialog.action === 'reactivate' && 'הפעל מחדש'}
                  {confirmDialog.action === 'delete' && 'מחק לצמיתות'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
