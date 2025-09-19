export interface FamilyMember {
  id: string
  name: string
  age: number
  type: "adult" | "child"
}

export const mockFamilyMembers: FamilyMember[] = [
  { id: "1", name: "שרה כהן", age: 35, type: "adult" },
  { id: "2", name: "דוד כהן", age: 37, type: "adult" },
  { id: "3", name: "נועה כהן", age: 8, type: "child" },
  { id: "4", name: "יונתן כהן", age: 5, type: "child" },
]
