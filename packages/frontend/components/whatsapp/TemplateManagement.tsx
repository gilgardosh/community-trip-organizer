'use client';

import { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, Plus, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
} from '@/lib/api';
import type {
  WhatsAppTemplate,
  CreateTemplateData,
  UpdateTemplateData,
} from '@/types/whatsapp';
import { EVENT_TYPE_LABELS } from '@/types/whatsapp';
import { TemplateEditor } from './TemplateEditor';

interface TemplateManagementProps {
  canEdit?: boolean; // Super Admin only
}

/**
 * TemplateManagement component
 * Manage WhatsApp message templates
 */
export function TemplateManagement({
  canEdit = false,
}: TemplateManagementProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getWhatsAppTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'שגיאה בטעינת תבניות',
        description: 'לא ניתן לטעון את התבניות. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (
    data: CreateTemplateData | UpdateTemplateData,
  ) => {
    try {
      await createWhatsAppTemplate(data as CreateTemplateData);
      toast({
        title: 'התבנית נוצרה בהצלחה',
        description: 'התבנית החדשה נוספה למערכת',
      });
      setIsCreateDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'שגיאה ביצירת תבנית',
        description:
          error instanceof Error
            ? error.message
            : 'לא ניתן ליצור את התבנית. אנא נסה שוב.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (
    data: CreateTemplateData | UpdateTemplateData,
  ) => {
    if (!editingTemplate) return;

    try {
      await updateWhatsAppTemplate(
        editingTemplate.id,
        data as UpdateTemplateData,
      );
      toast({
        title: 'התבנית עודכנה בהצלחה',
        description: 'השינויים נשמרו',
      });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'שגיאה בעדכון תבנית',
        description:
          error instanceof Error
            ? error.message
            : 'לא ניתן לעדכן את התבנית. אנא נסה שוב.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWhatsAppTemplate(id);
      toast({
        title: 'התבנית נמחקה בהצלחה',
        description: 'התבנית הוסרה מהמערכת',
      });
      setDeletingTemplateId(null);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'שגיאה במחיקת תבנית',
        description:
          error instanceof Error
            ? error.message
            : 'לא ניתן למחוק את התבנית. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (template: WhatsAppTemplate) => {
    try {
      await updateWhatsAppTemplate(template.id, {
        isActive: !template.isActive,
      });
      toast({
        title: template.isActive ? 'התבנית הושבתה' : 'התבנית הופעלה',
        description: 'הסטטוס עודכן בהצלחה',
      });
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את סטטוס התבנית. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול תבניות הודעות</h2>
        {canEdit && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                תבנית חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>יצירת תבנית חדשה</DialogTitle>
                <DialogDescription>
                  צור תבנית חדשה להודעות וואטסאפ. התבנית תהיה זמינה למנהלי
                  טיולים.
                </DialogDescription>
              </DialogHeader>
              <TemplateEditor
                mode="create"
                onSubmit={handleCreate}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>עדיין לא קיימות תבניות במערכת</p>
            {canEdit && (
              <p className="text-sm mt-2">
                לחץ על &quot;תבנית חדשה&quot; כדי להתחיל
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={template.isActive ? 'default' : 'secondary'}
                      >
                        {EVENT_TYPE_LABELS[template.eventType]}
                      </Badge>
                      {!template.isActive && (
                        <Badge variant="outline">לא פעיל</Badge>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(template)}
                        title={template.isActive ? 'השבת תבנית' : 'הפעל תבנית'}
                      >
                        {template.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTemplateId(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3 text-right">
                    {template.description}
                  </p>
                )}
                <div className="rounded-lg border bg-muted/50 p-3">
                  <pre className="whitespace-pre-wrap font-sans text-xs line-clamp-4 text-right">
                    {template.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingTemplate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>עריכת תבנית</DialogTitle>
              <DialogDescription>
                ערוך את התבנית {editingTemplate.name}
              </DialogDescription>
            </DialogHeader>
            <TemplateEditor
              mode="edit"
              initialData={editingTemplate}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTemplateId}
        onOpenChange={() => setDeletingTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת תבנית</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק תבנית זו? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingTemplateId && handleDelete(deletingTemplateId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
