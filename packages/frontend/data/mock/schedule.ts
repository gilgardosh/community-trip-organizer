export interface ScheduleItem {
  id: string;
  time: string;
  description: string;
}

export const mockScheduleItems: ScheduleItem[] = [
  { id: '1', time: '08:00', description: 'התכנסות בחניון' },
  { id: '2', time: '08:30', description: 'יציאה לטיול' },
  { id: '3', time: '12:00', description: 'ארוחת צהריים' },
  { id: '4', time: '15:00', description: 'חזרה הביתה' },
];
