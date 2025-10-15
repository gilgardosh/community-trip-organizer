'use client';

import { useState, useEffect } from 'react';
import { History, Filter, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getTripWhatsAppMessages } from '@/lib/api';
import type { WhatsAppMessage, MessageEventType } from '@/types/whatsapp';
import { EVENT_TYPE_LABELS, TRIGGER_TYPE_LABELS } from '@/types/whatsapp';
import { MessagePreview } from './MessagePreview';

interface MessageHistoryProps {
  tripId: string;
  tripName: string;
}

/**
 * MessageHistory component
 * Displays history of generated WhatsApp messages for a trip
 */
export function MessageHistory({ tripId, tripName }: MessageHistoryProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterEventType, setFilterEventType] = useState<
    MessageEventType | 'ALL'
  >('ALL');
  const [selectedMessage, setSelectedMessage] =
    useState<WhatsAppMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, [tripId]);

  useEffect(() => {
    if (filterEventType === 'ALL') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(
        messages.filter((msg) => msg.eventType === filterEventType),
      );
    }
  }, [filterEventType, messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getTripWhatsAppMessages(tripId);
      setMessages(data);
      setFilteredMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'שגיאה בטעינת היסטוריית הודעות',
        description: 'לא ניתן לטעון את היסטוריית ההודעות. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (selectedMessage) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedMessage(null)}>
          ← חזור לרשימה
        </Button>
        <MessagePreview
          content={selectedMessage.content}
          title={`${EVENT_TYPE_LABELS[selectedMessage.eventType]} - ${formatDate(selectedMessage.createdAt)}`}
          showCopyButton={true}
        />
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">סוג אירוע:</dt>
                <dd className="font-medium">
                  {EVENT_TYPE_LABELS[selectedMessage.eventType]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">סוג הפעלה:</dt>
                <dd>
                  <Badge variant="outline">
                    {TRIGGER_TYPE_LABELS[selectedMessage.triggerType]}
                  </Badge>
                </dd>
              </div>
              {selectedMessage.generatedBy && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">נוצר על ידי:</dt>
                  <dd className="font-medium">
                    {selectedMessage.generatedBy.name}
                  </dd>
                </div>
              )}
              {selectedMessage.template && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">תבנית:</dt>
                  <dd className="font-medium">
                    {selectedMessage.template.name}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            היסטוריית הודעות - {tripName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterEventType}
              onValueChange={(value) =>
                setFilterEventType(value as MessageEventType | 'ALL')
              }
            >
              <SelectTrigger className="w-[200px]" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">הכל</SelectItem>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterEventType === 'ALL'
              ? 'עדיין לא נשלחו הודעות לטיול זה'
              : 'לא נמצאו הודעות מסוג זה'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex-1 space-y-1 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {TRIGGER_TYPE_LABELS[message.triggerType]}
                      </Badge>
                    </div>
                    <div className="font-semibold">
                      {EVENT_TYPE_LABELS[message.eventType]}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {message.generatedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {message.generatedBy.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
