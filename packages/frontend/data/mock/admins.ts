export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'משתתף' | 'מנהל טיול' | 'סופר אדמין';
  avatar?: string;
}

export const mockAdmins: Admin[] = [
  {
    id: 'admin1',
    name: 'שרה מנהלת',
    email: 'sarah@example.com',
    role: 'מנהל טיול',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: 'admin2',
    name: 'יוסי מארגן',
    email: 'yossi@example.com',
    role: 'מנהל טיול',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: 'admin3',
    name: 'רחל משתתפת',
    email: 'rachel@example.com',
    role: 'משתתף',
  },
  {
    id: 'superadmin',
    name: 'אדמין ראשי',
    email: 'admin@example.com',
    role: 'סופר אדמין',
    avatar: '/placeholder.svg?height=40&width=40',
  },
];
