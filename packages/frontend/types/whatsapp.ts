// WhatsApp message types

export type MessageEventType =
  | 'TRIP_CREATED'
  | 'TRIP_PUBLISHED'
  | 'ATTENDANCE_UPDATE'
  | 'GEAR_ASSIGNMENT'
  | 'TRIP_REMINDER'
  | 'TRIP_START'
  | 'ATTENDANCE_CUTOFF_REMINDER'
  | 'CUSTOM';

export type TriggerType = 'MANUAL' | 'AUTOMATIC';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  eventType: MessageEventType;
  content: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  tripId?: string;
  templateId?: string;
  eventType: MessageEventType;
  content: string;
  triggerType: TriggerType;
  generatedById: string;
  generatedBy?: {
    id: string;
    name: string;
  };
  trip?: {
    id: string;
    name: string;
  };
  template?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateTemplateData {
  name: string;
  eventType: MessageEventType;
  content: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
}

export interface GenerateMessageData {
  templateId: string;
  tripId?: string;
  variables?: Record<string, string>;
  triggerType?: TriggerType;
}

export interface GenerateMessageResponse {
  content: string;
  messageId: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

// Variable definitions for each event type
export const EVENT_TYPE_VARIABLES: Record<
  MessageEventType,
  TemplateVariable[]
> = {
  TRIP_CREATED: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'location', label: 'מיקום', required: true },
    { name: 'startDate', label: 'תאריך התחלה', required: true },
    { name: 'endDate', label: 'תאריך סיום', required: true },
    { name: 'description', label: 'תיאור' },
    { name: 'admins', label: 'מנהלים' },
  ],
  TRIP_PUBLISHED: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'location', label: 'מיקום', required: true },
    { name: 'startDate', label: 'תאריך התחלה', required: true },
    { name: 'endDate', label: 'תאריך סיום', required: true },
    { name: 'cutoffDate', label: 'תאריך סגירת הרשמה', required: true },
    { name: 'admins', label: 'מנהלים' },
  ],
  ATTENDANCE_UPDATE: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'attendeeCount', label: 'מספר משתתפים', required: true },
    { name: 'attendeeList', label: 'רשימת משתתפים' },
  ],
  GEAR_ASSIGNMENT: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'gearList', label: 'רשימת ציוד', required: true },
  ],
  TRIP_REMINDER: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'location', label: 'מיקום', required: true },
    { name: 'startDate', label: 'תאריך התחלה', required: true },
    { name: 'daysUntilTrip', label: 'ימים עד הטיול', required: true },
  ],
  TRIP_START: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'location', label: 'מיקום', required: true },
    { name: 'schedule', label: 'לוח זמנים' },
  ],
  ATTENDANCE_CUTOFF_REMINDER: [
    { name: 'tripName', label: 'שם הטיול', required: true },
    { name: 'cutoffDate', label: 'תאריך סגירת הרשמה', required: true },
    { name: 'daysUntilCutoff', label: 'ימים עד סגירת הרשמה', required: true },
  ],
  CUSTOM: [],
};

// Hebrew labels for event types
export const EVENT_TYPE_LABELS: Record<MessageEventType, string> = {
  TRIP_CREATED: 'טיול נוצר',
  TRIP_PUBLISHED: 'טיול פורסם',
  ATTENDANCE_UPDATE: 'עדכון נוכחות',
  GEAR_ASSIGNMENT: 'הקצאת ציוד',
  TRIP_REMINDER: 'תזכורת לטיול',
  TRIP_START: 'התחלת טיול',
  ATTENDANCE_CUTOFF_REMINDER: 'תזכורת סגירת הרשמה',
  CUSTOM: 'הודעה מותאמת אישית',
};

// Hebrew labels for trigger types
export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  MANUAL: 'ידני',
  AUTOMATIC: 'אוטומטי',
};
