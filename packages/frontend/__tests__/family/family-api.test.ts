import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createFamily,
  getFamilies,
  getFamilyById,
  updateFamily,
  approveFamily,
  deactivateFamily,
  reactivateFamily,
  deleteFamily,
  getFamilyMembers,
  getFamilyAdults,
  getFamilyChildren,
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
} from '@/lib/api'

// Mock fetch
global.fetch = vi.fn()

function createFetchResponse(data: any, ok = true) {
  return {
    ok,
    json: async () => data,
  }
}

describe('Family API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createFamily', () => {
    it('should create a new family successfully', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת כהן',
        status: 'PENDING',
        isActive: true,
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const data = {
        name: 'משפחת כהן',
        adults: [
          {
            name: 'יוסי כהן',
            email: 'yossi@example.com',
            passwordHash: 'hashed',
          },
        ],
      }

      const result = await createFamily(data)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
      expect(result).toEqual(mockFamily)
    })

    it('should throw error when creation fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce(
        createFetchResponse({ message: 'Email already exists' }, false)
      )

      const data = {
        name: 'משפחת כהן',
        adults: [
          {
            name: 'יוסי כהן',
            email: 'yossi@example.com',
            passwordHash: 'hashed',
          },
        ],
      }

      await expect(createFamily(data)).rejects.toThrow('Email already exists')
    })
  })

  describe('getFamilies', () => {
    it('should fetch all families without filters', async () => {
      const mockFamilies = [
        { id: '1', name: 'משפחה 1', status: 'APPROVED', isActive: true, members: [], createdAt: '', updatedAt: '' },
        { id: '2', name: 'משפחה 2', status: 'PENDING', isActive: true, members: [], createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamilies))

      const result = await getFamilies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families'),
        expect.any(Object)
      )
      expect(result).toEqual(mockFamilies)
    })

    it('should fetch families with status filter', async () => {
      const mockFamilies = [
        { id: '1', name: 'משפחה 1', status: 'PENDING', isActive: true, members: [], createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamilies))

      await getFamilies({ status: 'PENDING' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=PENDING'),
        expect.any(Object)
      )
    })

    it('should fetch families with isActive filter', async () => {
      const mockFamilies = [
        { id: '1', name: 'משפחה 1', status: 'APPROVED', isActive: true, members: [], createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamilies))

      await getFamilies({ isActive: true })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('isActive=true'),
        expect.any(Object)
      )
    })
  })

  describe('getFamilyById', () => {
    it('should fetch a family by ID', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת כהן',
        status: 'APPROVED',
        isActive: true,
        members: [],
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const result = await getFamilyById('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123'),
        expect.any(Object)
      )
      expect(result).toEqual(mockFamily)
    })
  })

  describe('updateFamily', () => {
    it('should update family details', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת לוי',
        status: 'APPROVED',
        isActive: true,
        members: [],
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const data = { name: 'משפחת לוי' }
      const result = await updateFamily('123', data)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      )
      expect(result).toEqual(mockFamily)
    })
  })

  describe('approveFamily', () => {
    it('should approve a family', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת כהן',
        status: 'APPROVED',
        isActive: true,
        members: [],
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const result = await approveFamily('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/approve'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.status).toBe('APPROVED')
    })
  })

  describe('deactivateFamily', () => {
    it('should deactivate a family', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת כהן',
        status: 'APPROVED',
        isActive: false,
        members: [],
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const result = await deactivateFamily('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/deactivate'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.isActive).toBe(false)
    })
  })

  describe('reactivateFamily', () => {
    it('should reactivate a family', async () => {
      const mockFamily = {
        id: '123',
        name: 'משפחת כהן',
        status: 'APPROVED',
        isActive: true,
        members: [],
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockFamily))

      const result = await reactivateFamily('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/reactivate'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.isActive).toBe(true)
    })
  })

  describe('deleteFamily', () => {
    it('should delete a family', async () => {
      const mockResponse = { message: 'Family deleted successfully' }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await deleteFamily('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123'),
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.message).toBe('Family deleted successfully')
    })
  })

  describe('Family Members', () => {
    it('should fetch family members', async () => {
      const mockMembers = [
        { id: '1', name: 'יוסי', type: 'ADULT', email: 'yossi@example.com', familyId: '123', role: 'FAMILY', createdAt: '', updatedAt: '' },
        { id: '2', name: 'נועם', type: 'CHILD', age: 10, email: 'noam@child.local', familyId: '123', role: 'FAMILY', createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockMembers))

      const result = await getFamilyMembers('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/members'),
        expect.any(Object)
      )
      expect(result).toEqual(mockMembers)
    })

    it('should fetch family adults', async () => {
      const mockAdults = [
        { id: '1', name: 'יוסי', type: 'ADULT', email: 'yossi@example.com', familyId: '123', role: 'FAMILY', createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockAdults))

      const result = await getFamilyAdults('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/adults'),
        expect.any(Object)
      )
      expect(result).toEqual(mockAdults)
    })

    it('should fetch family children', async () => {
      const mockChildren = [
        { id: '2', name: 'נועם', type: 'CHILD', age: 10, email: 'noam@child.local', familyId: '123', role: 'FAMILY', createdAt: '', updatedAt: '' },
      ]

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockChildren))

      const result = await getFamilyChildren('123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/children'),
        expect.any(Object)
      )
      expect(result).toEqual(mockChildren)
    })

    it('should add a family member', async () => {
      const mockMember = {
        id: '456',
        name: 'שרה',
        type: 'ADULT',
        email: 'sara@example.com',
        familyId: '123',
        role: 'FAMILY',
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockMember))

      const data = {
        type: 'ADULT' as const,
        name: 'שרה',
        email: 'sara@example.com',
      }

      const result = await addFamilyMember('123', data)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/members'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
      expect(result).toEqual(mockMember)
    })

    it('should update a family member', async () => {
      const mockMember = {
        id: '456',
        name: 'שרה כהן',
        type: 'ADULT',
        email: 'sara@example.com',
        familyId: '123',
        role: 'FAMILY',
        createdAt: '',
        updatedAt: '',
      }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockMember))

      const data = { name: 'שרה כהן' }
      const result = await updateFamilyMember('123', '456', data)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/members/456'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      )
      expect(result.name).toBe('שרה כהן')
    })

    it('should remove a family member', async () => {
      const mockResponse = { message: 'Member removed successfully' }

      ;(global.fetch as any).mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await removeFamilyMember('123', '456')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/123/members/456'),
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.message).toBe('Member removed successfully')
    })
  })
})
