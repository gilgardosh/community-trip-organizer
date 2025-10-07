// Family management types

export type FamilyStatus = 'PENDING' | 'APPROVED'

export type UserType = 'ADULT' | 'CHILD'

export type Role = 'FAMILY' | 'TRIP_ADMIN' | 'SUPER_ADMIN'

export interface FamilyMember {
  id: string
  familyId: string
  type: UserType
  name: string
  age?: number
  email: string
  profilePhotoUrl?: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Family {
  id: string
  name?: string
  status: FamilyStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  members: FamilyMember[]
}

export interface CreateAdultData {
  name: string
  email: string
  password?: string
  profilePhotoUrl?: string
}

export interface CreateChildData {
  name: string
  age: number
}

export interface CreateFamilyData {
  name?: string
  adults: CreateAdultData[]
  children?: CreateChildData[]
}

export interface UpdateFamilyData {
  name?: string
}

export interface AddMemberData {
  type: UserType
  name: string
  age?: number
  email?: string
  password?: string
  profilePhotoUrl?: string
}

export interface UpdateMemberData {
  name?: string
  age?: number
  email?: string
  profilePhotoUrl?: string
}

export interface FamilyFilters {
  status?: FamilyStatus
  isActive?: boolean
}

export interface FamilyListItem extends Family {
  adultCount: number
  childCount: number
}
