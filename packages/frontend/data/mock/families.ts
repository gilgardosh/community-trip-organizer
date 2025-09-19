export interface Family {
  id: string
  name: string
  members: number
  adults: { name: string; age: number }[]
  children: { name: string; age: number }[]
  status: "active" | "pending" | "deactivated"
  joinDate: string
}

export const mockFamilies: Family[] = [
  {
    id: "1",
    name: "משפחת כהן",
    members: 4,
    adults: [
      { name: "דוד כהן", age: 35 },
      { name: "שרה כהן", age: 33 },
    ],
    children: [
      { name: "יוסי", age: 8 },
      { name: "מיכל", age: 5 },
    ],
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "משפחת לוי",
    members: 3,
    adults: [{ name: "אבי לוי", age: 40 }],
    children: [
      { name: "נועה", age: 12 },
      { name: "רון", age: 9 },
    ],
    status: "pending",
    joinDate: "2024-03-20",
  },
  {
    id: "3",
    name: "משפחת אברהם",
    members: 5,
    adults: [
      { name: "מיכאל אברהם", age: 38 },
      { name: "רחל אברהם", age: 36 },
    ],
    children: [
      { name: "אליה", age: 10 },
      { name: "תמר", age: 7 },
      { name: "רון", age: 3 },
    ],
    status: "active",
    joinDate: "2023-11-08",
  },
]
