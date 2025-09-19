export interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: "draft" | "published" | "completed" | "upcoming" | "past"
  adminId?: string
  adminName?: string
  description?: string
  attendanceCutoff?: string
  photoAlbumUrl?: string
  isAttending?: boolean
  dietaryInfo?: string
}

export const mockTrips: Trip[] = [
  {
    id: "1",
    name: "טיול לגן לאומי עין גדי",
    location: "עין גדי, ים המלח",
    startDate: "2024-12-15",
    endDate: "2024-12-16",
    status: "published",
    adminId: "admin1",
    adminName: "שרה מנהלת",
    description: "טיול משפחתי מרגש לגן הלאומי עין גדי עם טיול לנחל דוד ורחצה בים המלח",
    attendanceCutoff: "2024-12-10",
    photoAlbumUrl: "https://photos.google.com/share/example",
    isAttending: true,
    dietaryInfo: "ללא גלוטן עבור הילדים",
  },
  {
    id: "2",
    name: "קמפינג בגליל",
    location: "גליל עליון",
    startDate: "2025-02-20",
    endDate: "2025-02-22",
    status: "published",
    adminId: "admin1",
    adminName: "שרה מנהלת",
    description: "קמפינג משפחתי בטבע הגליל עם פעילויות חוץ ומדורות",
    attendanceCutoff: "2025-02-15",
    photoAlbumUrl: "https://photos.google.com/share/galil",
    isAttending: false,
    dietaryInfo: "",
  },
  {
    id: "3",
    name: "יום כיף בחוף הים",
    location: "חוף גורדון, תל אביב",
    startDate: "2024-08-10",
    endDate: "2024-08-10",
    status: "completed",
    adminId: "admin2",
    adminName: "יוסי מארגן",
    description: "יום כיף משפחתי בחוף הים עם משחקים ופעילויות מים",
    attendanceCutoff: "2024-08-05",
    photoAlbumUrl: "https://photos.google.com/share/beach",
    isAttending: true,
    dietaryInfo: "צמחוני",
  },
  {
    id: "4",
    name: "טיול לפארק הירקון",
    location: "פארק הירקון, תל אביב",
    startDate: "2024-07-15",
    endDate: "2024-07-15",
    status: "completed",
    adminId: "admin1",
    adminName: "שרה מנהלת",
    description: "טיול רגלי בפארק הירקון עם פיקניק משפחתי",
    attendanceCutoff: "2024-07-10",
    photoAlbumUrl: "https://photos.google.com/share/yarkon",
    isAttending: true,
    dietaryInfo: "אלרגיה לאגוזים",
  },
  {
    id: "5",
    name: "ביקור במוזיאון המדע",
    location: "מוזיאון המדע, חולון",
    startDate: "2025-01-22",
    endDate: "2025-01-22",
    status: "published",
    adminId: "admin2",
    adminName: "יוסי מארגן",
    description: "ביקור חינוכי במוזיאון המדע עם סדנאות אינטראקטיביות",
    attendanceCutoff: "2025-01-17",
    photoAlbumUrl: "https://photos.google.com/share/science",
    isAttending: false,
    dietaryInfo: "",
  },
  {
    id: "6",
    name: "טיול בנגב",
    location: "מכתש רמון",
    startDate: "2024-12-01",
    endDate: "2024-12-03",
    status: "published",
    adminId: "admin1",
    adminName: "שרה מנהלת",
    description: "טיול מרגש במכתש רמון עם לינה במדבר וצפייה בכוכבים",
    attendanceCutoff: "2024-11-25",
    photoAlbumUrl: "https://photos.google.com/share/negev",
    isAttending: false,
    dietaryInfo: "",
  },
]

export interface FamilyParticipation {
  tripId: string
  familyId: string
  isParticipating: boolean
  isAttending: boolean
  dietaryRequirements: string
  gearCommitments: Record<string, number>
}

export const mockFamilyParticipation: FamilyParticipation[] = [
  {
    tripId: "1",
    familyId: "family1",
    isParticipating: true,
    isAttending: true,
    dietaryRequirements: "ללא גלוטן עבור הילדים",
    gearCommitments: { "1": 1 },
  },
  {
    tripId: "2",
    familyId: "family1",
    isParticipating: false,
    isAttending: false,
    dietaryRequirements: "",
    gearCommitments: {},
  },
  {
    tripId: "3",
    familyId: "family1",
    isParticipating: true,
    isAttending: true,
    dietaryRequirements: "צמחוני",
    gearCommitments: { "2": 1 },
  },
  {
    tripId: "4",
    familyId: "family1",
    isParticipating: true,
    isAttending: true,
    dietaryRequirements: "אלרגיה לאגוזים",
    gearCommitments: {},
  },
  {
    tripId: "5",
    familyId: "family1",
    isParticipating: false,
    isAttending: false,
    dietaryRequirements: "",
    gearCommitments: {},
  },
  {
    tripId: "6",
    familyId: "family1",
    isParticipating: false,
    isAttending: false,
    dietaryRequirements: "",
    gearCommitments: {},
  },
]
