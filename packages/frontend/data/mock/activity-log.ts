export interface ActivityLogEntry {
  id: string
  timestamp: string
  userName: string
  userAvatar?: string
  action: "create" | "update" | "delete" | "login"
  entityType: "Trip" | "Family" | "Gear" | "User"
  entityName: string
  details: Record<string, any>
}

export const mockActivityLog: ActivityLogEntry[] = [
  {
    id: "1",
    timestamp: "2024-03-15T14:30:00Z",
    userName: "שרה מנהלת",
    userAvatar: "/placeholder.svg?height=32&width=32",
    action: "create",
    entityType: "Trip",
    entityName: "טיול לגן לאומי עין גדי",
    details: { location: "עין גדי", date: "2024-04-15", status: "draft" },
  },
  {
    id: "2",
    timestamp: "2024-03-15T13:45:00Z",
    userName: "דוד כהן",
    action: "update",
    entityType: "Family",
    entityName: "משפחת כהן",
    details: { dietary_info: "צמחוני", attendance: true },
  },
  {
    id: "3",
    timestamp: "2024-03-15T12:20:00Z",
    userName: "אדמין ראשי",
    userAvatar: "/placeholder.svg?height=32&width=32",
    action: "delete",
    entityType: "Gear",
    entityName: "כיסאות ישנים",
    details: { reason: "פריטים פגומים" },
  },
  {
    id: "4",
    timestamp: "2024-03-15T11:15:00Z",
    userName: "רחל אברהם",
    action: "login",
    entityType: "User",
    entityName: "רחל אברהם",
    details: { ip: "192.168.1.100", device: "mobile" },
  },
  {
    id: "5",
    timestamp: "2024-03-15T10:30:00Z",
    userName: "יוסי מארגן",
    userAvatar: "/placeholder.svg?height=32&width=32",
    action: "update",
    entityType: "Trip",
    entityName: "קמפינג בגליל",
    details: { status: "published", admin_assigned: "יוסי מארגן" },
  },
  {
    id: "6",
    timestamp: "2024-03-15T09:45:00Z",
    userName: "מיכל לוי",
    action: "create",
    entityType: "Family",
    entityName: "משפחת לוי",
    details: { members: 3, status: "pending" },
  },
  {
    id: "7",
    timestamp: "2024-03-15T08:20:00Z",
    userName: "אדמין ראשי",
    userAvatar: "/placeholder.svg?height=32&width=32",
    action: "update",
    entityType: "User",
    entityName: "שרה מנהלת",
    details: { role: "מנהל טיול", previous_role: "משתתף" },
  },
  {
    id: "8",
    timestamp: "2024-03-14T16:30:00Z",
    userName: "דוד כהן",
    action: "create",
    entityType: "Gear",
    entityName: "אוהלים חדשים",
    details: { quantity: 5, assigned_to: "משפחת כהן" },
  },
]
