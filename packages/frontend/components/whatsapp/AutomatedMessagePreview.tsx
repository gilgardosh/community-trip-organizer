'use client';

import { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EVENT_TYPE_LABELS } from '@/types/whatsapp';
import type { MessageEventType } from '@/types/whatsapp';

interface AutomatedMessagePreviewProps {
  eventType: MessageEventType;
  tripName: string;
  previewData: Record<string, string>;
  templateContent: string;
}

/**
 * AutomatedMessagePreview component
 * Shows preview of automated messages that will be sent on events
 */
export function AutomatedMessagePreview({
  eventType,
  previewData,
  templateContent,
}: AutomatedMessagePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Replace variables in template with preview data
  const generatePreviewContent = (): string => {
    let content = templateContent;

    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  };

  const previewContent = generatePreviewContent();

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              הודעה אוטומטית
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              הודעה זו תישלח אוטומטית כאשר מתרחש אירוע:{' '}
              <span className="font-semibold">
                {EVENT_TYPE_LABELS[eventType]}
              </span>
            </p>
          </div>
          <Badge variant="secondary">{EVENT_TYPE_LABELS[eventType]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1"
          >
            <Eye className="ml-2 h-4 w-4" />
            {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
          </Button>
        </div>

        {showPreview && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">
              תצוגה מקדימה:
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-right">
              {previewContent}
            </pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 text-right">
          <p className="font-semibold">💡 טיפ:</p>
          <p>
            הודעה זו תישלח באופן אוטומטי למנהלי הטיול כאשר האירוע מתרחש. מנהלי
            הטיול יכולים להעתיק את ההודעה ולהדביק אותה בוואטסאפ.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
