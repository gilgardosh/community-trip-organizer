import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  loginSchema,
  registerSchema,
} from '@/lib/validation';

describe('Validation Helpers', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.il')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user @domain.com')).toBe(false);
    });

    it('rejects empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates correct passwords', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
      expect(validatePassword('ValidPass99')).toBe(true);
    });

    it('rejects passwords that are too short', () => {
      expect(validatePassword('Pass1')).toBe(false);
      expect(validatePassword('Ab1')).toBe(false);
    });

    it('rejects passwords without uppercase letters', () => {
      expect(validatePassword('password123')).toBe(false);
    });

    it('rejects passwords without lowercase letters', () => {
      expect(validatePassword('PASSWORD123')).toBe(false);
    });

    it('rejects passwords without numbers', () => {
      expect(validatePassword('PasswordABC')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('validates correct Israeli phone numbers', () => {
      expect(validatePhone('0501234567')).toBe(true);
      expect(validatePhone('0521234567')).toBe(true);
      expect(validatePhone('0541234567')).toBe(true);
      expect(validatePhone('0231234567')).toBe(true);
      expect(validatePhone('0891234567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false);
      expect(validatePhone('050123456')).toBe(false); // Too short
      expect(validatePhone('05012345678')).toBe(false); // Too long
      expect(validatePhone('0701234567')).toBe(false); // Invalid prefix
    });

    it('accepts empty phone (optional field)', () => {
      expect(validatePhone('')).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing email', () => {
      const result = loginSchema.safeParse({
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '0501234567',
        familyName: 'משפחת טסט',
      });
      expect(result.success).toBe(true);
    });

    it('rejects when passwords do not match', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) =>
          issue.path.includes('confirmPassword'),
        );
        expect(passwordError).toBeDefined();
      }
    });

    it('rejects weak passwords', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short names', () => {
      const result = registerSchema.safeParse({
        name: 'A',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
      expect(result.success).toBe(false);
    });

    it('accepts optional fields as empty', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '',
        familyName: '',
      });
      expect(result.success).toBe(true);
    });
  });
});
