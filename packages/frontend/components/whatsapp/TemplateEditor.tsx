'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type {
  MessageEventType,
  CreateTemplateData,
  UpdateTemplateData,
  TemplateVariable,
} from '@/types/whatsapp';
import { EVENT_TYPE_LABELS, EVENT_TYPE_VARIABLES } from '@/types/whatsapp';

interface TemplateEditorProps {
  initialData?: {
    name?: string;
    eventType?: MessageEventType;
    content?: string;
    description?: string;
    isActive?: boolean;
  };
  mode: 'create' | 'edit';
  onSubmit: (data: CreateTemplateData | UpdateTemplateData) => Promise<void>;
  onCancel?: () => void;
}

/**
 * TemplateEditor component
 * Form for creating and editing WhatsApp message templates
 */
export function TemplateEditor({
  initialData,
  mode,
  onSubmit,
  onCancel,
}: TemplateEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [eventType, setEventType] = useState<MessageEventType>(
    initialData?.eventType || 'CUSTOM',
  );
  const [content, setContent] = useState(initialData?.content || '');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get available variables for selected event type
  const availableVariables: TemplateVariable[] =
    EVENT_TYPE_VARIABLES[eventType] || [];

  const insertVariable = (variableName: string) => {
    const variableTag = `{${variableName}}`;
    const textarea = document.getElementById(
      'template-content',
    ) as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + variableTag + content.substring(end);

      setContent(newContent);

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variableTag.length,
          start + variableTag.length,
        );
      }, 0);
    } else {
      setContent(content + variableTag);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם לתבנית',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין תוכן לתבנית',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateTemplateData | UpdateTemplateData = {
        name: name.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
        isActive,
        ...(mode === 'create' && { eventType }),
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Right column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">שם התבנית *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: תזכורת לטיול - עברית"
              required
              dir="rtl"
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="event-type">סוג אירוע *</Label>
              <Select
                value={eventType}
                onValueChange={(value) =>
                  setEventType(value as MessageEventType)
                }
              >
                <SelectTrigger id="event-type" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="template-description">תיאור</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של מטרת התבנית"
              rows={3}
              dir="rtl"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is-active" className="text-base">
                תבנית פעילה
              </Label>
              <p className="text-sm text-muted-foreground">
                תבניות לא פעילות לא יופיעו ברשימה
              </p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        {/* Left column - Available Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">משתנים זמינים</CardTitle>
          </CardHeader>
          <CardContent>
            {availableVariables.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  לחץ על משתנה כדי להוסיף אותו לתבנית:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableVariables.map((variable) => (
                    <Badge
                      key={variable.name}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => insertVariable(variable.name)}
                    >
                      {`{${variable.name}}`}
                      {variable.required && (
                        <span className="mr-1 text-red-500">*</span>
                      )}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className="text-right">
                      <span className="font-mono font-semibold">
                        {`{${variable.name}}`}
                      </span>
                      {' - '}
                      {variable.label}
                      {variable.description && (
                        <span className="text-muted-foreground/70">
                          {' '}
                          ({variable.description})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                סוג אירוע זה לא כולל משתנים מוגדרים מראש. ניתן להוסיף משתנים
                מותאמים אישית בתוכן התבנית.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <Label htmlFor="template-content">תוכן התבנית *</Label>
        <Textarea
          id="template-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="הזן את תוכן התבנית. השתמש ב-{משתנה} להחלפה דינמית."
          rows={10}
          className="font-mono"
          required
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground text-right">
          השתמש בסימנים מיוחדים כמו 🎯 📅 ⏰ ✅ לעיצוב טוב יותר של ההודעה
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'שומר...'
            : mode === 'create'
              ? 'צור תבנית'
              : 'עדכן תבנית'}
        </Button>
      </div>
    </form>
  );
}
