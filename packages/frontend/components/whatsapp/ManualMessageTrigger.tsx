'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessagePreview } from './MessagePreview';
import { useToast } from '@/hooks/use-toast';
import {
  generateTripCreatedMessage,
  generateTripPublishedMessage,
  generateAttendanceUpdateMessage,
  generateGearAssignmentMessage,
  generateTripReminderMessage,
  generateTripStartMessage,
  generateAttendanceCutoffReminderMessage,
} from '@/lib/api';

interface ManualMessageTriggerProps {
  tripId: string;
  tripName: string;
}

type MessageType =
  | 'trip-created'
  | 'trip-published'
  | 'attendance-update'
  | 'gear-assignment'
  | 'trip-reminder'
  | 'trip-start'
  | 'cutoff-reminder';

const MESSAGE_TYPES: Record<
  MessageType,
  { label: string; description: string; requiresDays?: boolean }
> = {
  'trip-created': {
    label: 'טיול נוצר',
    description: 'הודעת יצירת טיול חדש',
  },
  'trip-published': {
    label: 'טיול פורסם',
    description: 'הודעת פרסום טיול',
  },
  'attendance-update': {
    label: 'עדכון נוכחות',
    description: 'רשימת משתתפים עדכנית',
  },
  'gear-assignment': {
    label: 'הקצאת ציוד',
    description: 'רשימת ציוד והקצאות',
  },
  'trip-reminder': {
    label: 'תזכורת לטיול',
    description: 'תזכורת לפני הטיול',
    requiresDays: true,
  },
  'trip-start': {
    label: 'התחלת טיול',
    description: 'הודעת יום הטיול',
  },
  'cutoff-reminder': {
    label: 'תזכורת סגירת הרשמה',
    description: 'תזכורת לפני תאריך הסגירה',
  },
};

/**
 * ManualMessageTrigger component
 * Interface for manually triggering WhatsApp messages
 */
export function ManualMessageTrigger({
  tripId,
  tripName,
}: ManualMessageTriggerProps) {
  const [selectedType, setSelectedType] =
    useState<MessageType>('trip-reminder');
  const [daysUntilTrip, setDaysUntilTrip] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const requiresDays = MESSAGE_TYPES[selectedType].requiresDays;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedMessage(null);

    try {
      let response;

      switch (selectedType) {
        case 'trip-created':
          response = await generateTripCreatedMessage(tripId);
          break;
        case 'trip-published':
          response = await generateTripPublishedMessage(tripId);
          break;
        case 'attendance-update':
          response = await generateAttendanceUpdateMessage(tripId);
          break;
        case 'gear-assignment':
          response = await generateGearAssignmentMessage(tripId);
          break;
        case 'trip-reminder':
          response = await generateTripReminderMessage(tripId, daysUntilTrip);
          break;
        case 'trip-start':
          response = await generateTripStartMessage(tripId);
          break;
        case 'cutoff-reminder':
          response = await generateAttendanceCutoffReminderMessage(tripId);
          break;
      }

      setGeneratedMessage(response.content);

      toast({
        title: 'ההודעה נוצרה בהצלחה',
        description: 'כעת ניתן להעתיק את ההודעה לוואטסאפ',
      });
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: 'שגיאה ביצירת הודעה',
        description:
          error instanceof Error
            ? error.message
            : 'לא ניתן ליצור את ההודעה. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            שלח הודעת וואטסאפ - {tripName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-type">סוג הודעה</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as MessageType)}
            >
              <SelectTrigger id="message-type" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MESSAGE_TYPES).map(
                  ([value, { label, description }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="text-right">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {description}
                        </div>
                      </div>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {requiresDays && (
            <div className="space-y-2">
              <Label htmlFor="days-until-trip">מספר ימים עד הטיול</Label>
              <Input
                id="days-until-trip"
                type="number"
                min="1"
                value={daysUntilTrip}
                onChange={(e) => setDaysUntilTrip(Number(e.target.value))}
                dir="rtl"
              />
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מייצר הודעה...
              </>
            ) : (
              <>
                <Send className="ml-2 h-4 w-4" />
                צור הודעה
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedMessage && (
        <MessagePreview
          content={generatedMessage}
          title="הודעה שנוצרה"
          showCopyButton={true}
        />
      )}
    </div>
  );
}
