'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MessagePreviewProps {
  content: string;
  title?: string;
  className?: string;
  showCopyButton?: boolean;
}

/**
 * MessagePreview component
 * Displays formatted WhatsApp message with copy-to-clipboard functionality
 */
export function MessagePreview({
  content,
  title = 'תצוגה מקדימה',
  className = '',
  showCopyButton = true,
}: MessagePreviewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'הועתק בהצלחה',
        description: 'ההודעה הועתקה ללוח. כעת ניתן להדביק אותה בוואטסאפ.',
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעתיק את ההודעה. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {showCopyButton && (
          <Button
            onClick={copyToClipboard}
            variant={copied ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                הועתק
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                העתק
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-right">
            {content}
          </pre>
        </div>
        {showCopyButton && (
          <p className="mt-3 text-xs text-muted-foreground text-right">
            לחץ על &quot;העתק&quot; כדי להעתיק את ההודעה ללוח, ולאחר מכן הדבק
            אותה בקבוצת הוואטסאפ שלך.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
