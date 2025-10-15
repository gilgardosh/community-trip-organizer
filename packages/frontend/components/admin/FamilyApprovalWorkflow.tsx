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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Loader2, Users, Calendar } from 'lucide-react';
import {
  getPendingFamilies,
  adminApproveFamily,
  bulkApproveFamilies,
  adminDeactivateFamily,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Family } from '@/types/family';

export function FamilyApprovalWorkflow() {
  const [pendingFamilies, setPendingFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(
    new Set(),
  );
  const [processingFamily, setProcessingFamily] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'bulk-approve';
    familyId?: string;
    familyName?: string;
  }>({ open: false, action: 'approve' });
  const { toast } = useToast();

  useEffect(() => {
    loadPendingFamilies();
  }, []);

  const loadPendingFamilies = async () => {
    try {
      setLoading(true);
      const data = await getPendingFamilies();
      setPendingFamilies(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת משפחות ממתינות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFamily = async (familyId: string) => {
    try {
      setProcessingFamily(familyId);
      await adminApproveFamily(familyId);

      toast({
        title: 'הצלחה',
        description: 'המשפחה אושרה בהצלחה',
      });

      await loadPendingFamilies();
      setConfirmDialog({ open: false, action: 'approve' });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל באישור המשפחה',
        variant: 'destructive',
      });
    } finally {
      setProcessingFamily(null);
    }
  };

  const handleRejectFamily = async (familyId: string) => {
    try {
      setProcessingFamily(familyId);
      await adminDeactivateFamily(familyId);

      toast({
        title: 'הצלחה',
        description: 'המשפחה נדחתה',
      });

      await loadPendingFamilies();
      setConfirmDialog({ open: false, action: 'reject' });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בדחיית המשפחה',
        variant: 'destructive',
      });
    } finally {
      setProcessingFamily(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedFamilies.size === 0) return;

    try {
      setBulkProcessing(true);
      const result = await bulkApproveFamilies({
        familyIds: Array.from(selectedFamilies),
      });

      toast({
        title: 'הצלחה',
        description: `${result.approvedCount} משפחות אושרו בהצלחה`,
      });

      setSelectedFamilies(new Set());
      await loadPendingFamilies();
      setConfirmDialog({ open: false, action: 'bulk-approve' });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל באישור משפחות',
        variant: 'destructive',
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleFamilySelection = (familyId: string) => {
    const newSelection = new Set(selectedFamilies);
    if (newSelection.has(familyId)) {
      newSelection.delete(familyId);
    } else {
      newSelection.add(familyId);
    }
    setSelectedFamilies(newSelection);
  };

  const toggleAllFamilies = () => {
    if (selectedFamilies.size === pendingFamilies.length) {
      setSelectedFamilies(new Set());
    } else {
      setSelectedFamilies(new Set(pendingFamilies.map((f) => f.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">טוען משפחות ממתינות...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>אישור משפחות</CardTitle>
              <CardDescription>
                סקור ואשר משפחות חדשות המבקשות להצטרף למערכת
              </CardDescription>
            </div>
            {pendingFamilies.length > 0 && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                {pendingFamilies.length} ממתינות
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk Actions */}
          {selectedFamilies.size > 0 && (
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedFamilies.size} משפחות נבחרו
              </span>
              <Button
                onClick={() =>
                  setConfirmDialog({ open: true, action: 'bulk-approve' })
                }
                disabled={bulkProcessing}
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    מאשר...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    אשר נבחרות
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Families Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-12">
                    <Checkbox
                      checked={
                        pendingFamilies.length > 0 &&
                        selectedFamilies.size === pendingFamilies.length
                      }
                      onCheckedChange={toggleAllFamilies}
                    />
                  </TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                  <TableHead className="text-right">תאריך הגשה</TableHead>
                  <TableHead className="text-right">חברים</TableHead>
                  <TableHead className="text-right">שם המשפחה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFamilies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-8 w-8" />
                        <p>אין משפחות ממתינות לאישור</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingFamilies.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFamilies.has(family.id)}
                          onCheckedChange={() =>
                            toggleFamilySelection(family.id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: 'approve',
                                familyId: family.id,
                                familyName: family.name || 'משפחה ללא שם',
                              })
                            }
                            disabled={processingFamily === family.id}
                          >
                            {processingFamily === family.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 ml-1" />
                                אשר
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: 'reject',
                                familyId: family.id,
                                familyName: family.name || 'משפחה ללא שם',
                              })
                            }
                            disabled={processingFamily === family.id}
                          >
                            <XCircle className="h-3 w-3 ml-1" />
                            דחה
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(family.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {family.members.length} חברים
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {
                                family.members.filter((m) => m.type === 'ADULT')
                                  .length
                              }{' '}
                              מבוגרים,{' '}
                              {
                                family.members.filter((m) => m.type === 'CHILD')
                                  .length
                              }{' '}
                              ילדים
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {family.name || 'משפחה ללא שם'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
              {confirmDialog.action === 'approve' && 'אישור משפחה'}
              {confirmDialog.action === 'reject' && 'דחיית משפחה'}
              {confirmDialog.action === 'bulk-approve' && 'אישור משפחות'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'approve' &&
                `האם אתה בטוח שברצונך לאשר את ${confirmDialog.familyName}?`}
              {confirmDialog.action === 'reject' &&
                `האם אתה בטוח שברצונך לדחות את ${confirmDialog.familyName}?`}
              {confirmDialog.action === 'bulk-approve' &&
                `האם אתה בטוח שברצונך לאשר ${selectedFamilies.size} משפחות?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                if (
                  confirmDialog.action === 'approve' &&
                  confirmDialog.familyId
                ) {
                  handleApproveFamily(confirmDialog.familyId);
                } else if (
                  confirmDialog.action === 'reject' &&
                  confirmDialog.familyId
                ) {
                  handleRejectFamily(confirmDialog.familyId);
                } else if (confirmDialog.action === 'bulk-approve') {
                  handleBulkApprove();
                }
              }}
              variant={
                confirmDialog.action === 'reject' ? 'destructive' : 'default'
              }
            >
              {confirmDialog.action === 'approve' && 'אשר'}
              {confirmDialog.action === 'reject' && 'דחה'}
              {confirmDialog.action === 'bulk-approve' && 'אשר הכל'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
