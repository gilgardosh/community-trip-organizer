export interface GearItem {
  id: string;
  name: string;
  quantityNeeded: number;
  quantityAssigned?: number;
  assignedFamilies: string[];
}

export const mockGearItems: GearItem[] = [
  {
    id: '1',
    name: 'אוהלים',
    quantityNeeded: 3,
    quantityAssigned: 2,
    assignedFamilies: ['משפחת כהן', 'משפחת אברהם'],
  },
  {
    id: '2',
    name: 'כיסאות קמפינג',
    quantityNeeded: 8,
    quantityAssigned: 3,
    assignedFamilies: ['משפחת לוי'],
  },
  {
    id: '3',
    name: 'מנגל',
    quantityNeeded: 2,
    quantityAssigned: 0,
    assignedFamilies: [],
  },
  {
    id: '4',
    name: 'אוהלים (4 אנשים)',
    quantityNeeded: 5,
    quantityAssigned: 2,
    assignedFamilies: ['משפחת כהן', 'משפחת לוי'],
  },
  {
    id: '5',
    name: 'כיריים גז',
    quantityNeeded: 3,
    quantityAssigned: 1,
    assignedFamilies: ['משפחת אברהם'],
  },
  {
    id: '6',
    name: 'מקרר נייד',
    quantityNeeded: 2,
    quantityAssigned: 0,
    assignedFamilies: [],
  },
  {
    id: '7',
    name: 'כדורי כדורגל',
    quantityNeeded: 2,
    quantityAssigned: 1,
    assignedFamilies: ['משפחת דוד'],
  },
  {
    id: '8',
    name: 'ערכת עזרה ראשונה',
    quantityNeeded: 1,
    quantityAssigned: 0,
    assignedFamilies: [],
  },
];
