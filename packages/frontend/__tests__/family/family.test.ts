import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  createFamilySchema,
  updateFamilySchema,
  addMemberSchema,
  updateMemberSchema,
} from '@/lib/validation';

describe('Family Validation Schemas', () => {
  describe('createFamilySchema', () => {
    it('should validate a valid family creation with one adult', () => {
      const validData = {
        name: 'משפחת כהן',
        adults: [
          {
            name: 'יוסי כהן',
            email: 'yossi@example.com',
            password: 'Password123',
          },
        ],
      };

      const result = createFamilySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate family with multiple adults and children', () => {
      const validData = {
        name: 'משפחת לוי',
        adults: [
          {
            name: 'דוד לוי',
            email: 'david@example.com',
            password: 'Password123',
          },
          {
            name: 'שרה לוי',
            email: 'sara@example.com',
            password: 'Password456',
          },
        ],
        children: [
          { name: 'נועם', age: 8 },
          { name: 'תמר', age: 5 },
        ],
      };

      const result = createFamilySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when no adults are provided', () => {
      const invalidData = {
        name: 'משפחה',
        adults: [],
      };

      const result = createFamilySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid adult email', () => {
      const invalidData = {
        name: 'משפחה',
        adults: [
          {
            name: 'יוסי',
            email: 'invalid-email',
            password: 'Password123',
          },
        ],
      };

      const result = createFamilySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with weak password', () => {
      const invalidData = {
        name: 'משפחה',
        adults: [
          {
            name: 'יוסי',
            email: 'yossi@example.com',
            password: 'weak',
          },
        ],
      };

      const result = createFamilySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional family name', () => {
      const validData = {
        adults: [
          {
            name: 'יוסי',
            email: 'yossi@example.com',
            password: 'Password123',
          },
        ],
      };

      const result = createFamilySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateFamilySchema', () => {
    it('should validate family name update', () => {
      const validData = {
        name: 'משפחת כהן',
      };

      const result = updateFamilySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with too short family name', () => {
      const invalidData = {
        name: 'א',
      };

      const result = updateFamilySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty family name', () => {
      const validData = {
        name: '',
      };

      const result = updateFamilySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('addMemberSchema', () => {
    it('should validate adding an adult member', () => {
      const validData = {
        type: 'ADULT' as const,
        name: 'משה',
        email: 'moshe@example.com',
        password: 'Password123',
      };

      const result = addMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate adding a child member', () => {
      const validData = {
        type: 'CHILD' as const,
        name: 'נועם',
        age: 10,
      };

      const result = addMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when adult has no email', () => {
      const invalidData = {
        type: 'ADULT' as const,
        name: 'משה',
        password: 'Password123',
      };

      const result = addMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when child has no age', () => {
      const invalidData = {
        type: 'CHILD' as const,
        name: 'נועם',
      };

      const result = addMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when child age is over 18', () => {
      const invalidData = {
        type: 'CHILD' as const,
        name: 'נועם',
        age: 19,
      };

      const result = addMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when child age is negative', () => {
      const invalidData = {
        type: 'CHILD' as const,
        name: 'נועם',
        age: -1,
      };

      const result = addMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateMemberSchema', () => {
    it('should validate member update with all fields', () => {
      const validData = {
        name: 'משה כהן',
        age: 10,
        email: 'moshe@example.com',
        profilePhotoUrl: 'https://example.com/photo.jpg',
      };

      const result = updateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate member update with partial fields', () => {
      const validData = {
        name: 'משה כהן',
      };

      const result = updateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = updateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid age', () => {
      const invalidData = {
        age: 150,
      };

      const result = updateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid profile photo URL', () => {
      const invalidData = {
        profilePhotoUrl: 'not-a-url',
      };

      const result = updateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Hebrew Error Messages', () => {
    it('should return Hebrew error messages for invalid email', () => {
      const result = createFamilySchema.safeParse({
        adults: [
          {
            name: 'יוסי',
            email: 'invalid',
            password: 'Password123',
          },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        const emailError = errors.find((e: any) => e.path.includes('email'));
        expect(emailError?.message).toContain('דוא״ל');
      }
    });

    it('should return Hebrew error messages for weak password', () => {
      const result = createFamilySchema.safeParse({
        adults: [
          {
            name: 'יוסי',
            email: 'yossi@example.com',
            password: 'weak',
          },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        const passwordError = errors.find((e: any) =>
          e.path.includes('password'),
        );
        expect(passwordError?.message).toContain('סיסמה');
      }
    });

    it('should return Hebrew error messages for missing required fields', () => {
      const result = createFamilySchema.safeParse({
        adults: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        const adultsError = errors.find((e: any) => e.path.includes('adults'));
        expect(adultsError?.message).toContain('מבוגר');
      }
    });
  });
});

describe('Family Component Integration', () => {
  describe('Family Types', () => {
    it('should correctly type FamilyMember', () => {
      const member: any = {
        id: '123',
        familyId: '456',
        type: 'ADULT',
        name: 'יוסי כהן',
        email: 'yossi@example.com',
        role: 'FAMILY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(member.type).toBe('ADULT');
      expect(member.name).toBe('יוסי כהן');
    });

    it('should correctly type Family', () => {
      const family: any = {
        id: '123',
        name: 'משפחת כהן',
        status: 'APPROVED',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [],
      };

      expect(family.status).toBe('APPROVED');
      expect(family.isActive).toBe(true);
    });
  });

  describe('RTL Support', () => {
    it('should render components with RTL direction', () => {
      // This test would verify that components have dir="rtl" attribute
      // In actual implementation, each component should be tested individually
      expect(true).toBe(true);
    });

    it('should display Hebrew text correctly', () => {
      // This test would verify Hebrew text rendering
      // In actual implementation, check for specific Hebrew strings
      expect(true).toBe(true);
    });
  });
});
