/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { Role } from '@prisma/client';
import { clearDatabase } from './utils/db.js';
import { createTestUser, createTestUserWithRole } from './utils/auth-helper.js';
import { authService } from '../src/services/auth.service.js';
import { clearRateLimits } from '../src/middleware/rateLimiter.js';

// Mock the logging service to avoid DB foreign key constraints
vi.mock('../src/services/log.service.js', () => ({
  logService: {
    log: vi.fn().mockResolvedValue({}),
    logUserAction: vi.fn().mockResolvedValue({}),
    logLogin: vi.fn().mockResolvedValue({}),
    logOAuthLogin: vi.fn().mockResolvedValue({}),
  },
  __esModule: true,
}));

describe('Rate Limiter Middleware', () => {
  beforeAll(async () => {
    // Enable rate limiting for these tests
    process.env.TEST_RATE_LIMITING = 'true';
    await clearDatabase();
  });

  afterEach(async () => {
    // Clear rate limits and database between tests
    clearRateLimits();
    await clearDatabase();
  });

  afterAll(async () => {
    // Disable rate limiting after tests
    delete process.env.TEST_RATE_LIMITING;
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('Auth Rate Limiting (5 requests per 15 minutes)', () => {
    it('should allow requests within the rate limit', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Create a user first
      await createTestUser(loginData.email, loginData.password);

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        // Should not be rate limited
        expect(response.status).not.toBe(429);
        expect(response.headers).toHaveProperty('x-ratelimit-limit');
        expect(response.headers).toHaveProperty('x-ratelimit-remaining');
        expect(response.headers).toHaveProperty('x-ratelimit-reset');
      }
    });

    it('should block requests exceeding the rate limit', async () => {
      const loginData = {
        email: 'ratelimit@example.com',
        password: 'password123',
      };

      // Create a user first
      await createTestUser(loginData.email, loginData.password);

      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send(loginData);
      }

      // The 6th request should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.headers).toHaveProperty('x-ratelimit-limit', '5');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining', '0');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/too many/i);
    });

    it('should include rate limit headers in response', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        familyName: 'Test Family',
        phone: '1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);

      expect(limit).toBe(5);
      expect(remaining).toBeLessThan(limit);
    });

    it('should track rate limits separately for different endpoints', async () => {
      const loginData = {
        email: 'separate@example.com',
        password: 'password123',
      };

      const registerData = {
        email: 'newseparate@example.com',
        password: 'password123',
        name: 'New User',
        familyName: 'Test Family',
        phone: '1234567890',
      };

      // Create a user for login
      await createTestUser(loginData.email, loginData.password);

      // Make 5 login requests (at limit)
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send(loginData);
      }

      // Register should still work (different rate limit bucket)
      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      // Should succeed since it's a different endpoint
      expect(response.status).not.toBe(429);
    });
  });

  describe('Admin Rate Limiting (20 requests per minute)', () => {
    it('should apply rate limiting to admin endpoints', async () => {
      // Create super admin user
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      // Make 20 requests (at limit)
      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).not.toBe(429);
      }

      // The 21st request should be rate limited
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(429);
    });

    it('should include proper rate limit headers for admin routes', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const response = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      expect(limit).toBe(20);
    });
  });

  describe('Write Operations Rate Limiting (10 requests per minute)', () => {
    it('should apply rate limiting to trip creation', async () => {
      const tripAdmin = await createTestUserWithRole(Role.TRIP_ADMIN);
      const token = authService.generateToken(tripAdmin);

      const tripData = {
        name: 'Test Trip',
        description: 'Test Description',
        destination: 'Test Destination',
        startDate: new Date('2025-12-01').toISOString(),
        endDate: new Date('2025-12-05').toISOString(),
        attendanceCutoffDate: new Date('2025-11-15').toISOString(),
        price: 100,
        maxFamilies: 20,
      };

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/trips')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...tripData, name: `Test Trip ${i}` });

        expect(response.status).not.toBe(429);
      }

      // The 11th request should be rate limited
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${token}`)
        .send(tripData);

      expect(response.status).toBe(429);
    });

    it('should apply rate limiting to family updates', async () => {
      const familyUser = await createTestUser();
      const token = authService.generateToken(familyUser);

      const updateData = {
        phone: '9876543210',
      };

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .put(`/api/families/${familyUser.familyId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(response.status).not.toBe(429);
      }

      // The 11th request should be rate limited
      const response = await request(app)
        .put(`/api/families/${familyUser.familyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(429);
    });

    it('should apply rate limiting to WhatsApp operations', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const templateData = {
        name: 'Test Template',
        content: 'Test content with {{placeholder}}',
        category: 'TRIP_ANNOUNCEMENT',
        language: 'en',
      };

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/whatsapp/templates')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...templateData, name: `Test Template ${i}` });

        expect(response.status).not.toBe(429);
      }

      // The 11th request should be rate limited
      const response = await request(app)
        .post('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${token}`)
        .send(templateData);

      expect(response.status).toBe(429);
    });
  });

  describe('General API Rate Limiting (100 requests per 15 minutes)', () => {
    it('should apply baseline rate limiting to all API routes', async () => {
      // Health endpoint should have general API rate limiting
      const responses: number[] = [];

      // Make many requests to test general API limit
      for (let i = 0; i < 105; i++) {
        const response = await request(app).get('/api/health');
        responses.push(response.status);
      }

      // At least one should be rate limited (429)
      const rateLimitedCount = responses.filter(
        (status) => status === 429,
      ).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should have higher limit than specific endpoint limits', async () => {
      const response = await request(app).get('/api/health');

      const limit = parseInt(response.headers['x-ratelimit-limit']);

      // General API limit should be 100
      expect(limit).toBe(100);
    });
  });

  describe('Rate Limit Reset', () => {
    it('should include reset timestamp in headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-ratelimit-reset');

      const resetTime = new Date(response.headers['x-ratelimit-reset']);
      const now = new Date();

      // Reset time should be in the future
      expect(resetTime.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should provide valid ISO timestamp for reset', async () => {
      const response = await request(app).get('/api/health');

      const resetHeader = response.headers['x-ratelimit-reset'];

      // Should be a valid ISO date string
      expect(() => new Date(resetHeader)).not.toThrow();
      expect(new Date(resetHeader).toISOString()).toBe(resetHeader);
    });
  });

  describe('Rate Limit Tracking', () => {
    it('should decrement remaining count with each request', async () => {
      const responses = [];

      // Make 3 requests and track remaining count
      for (let i = 0; i < 3; i++) {
        const response = await request(app).get('/api/health');
        responses.push({
          remaining: parseInt(response.headers['x-ratelimit-remaining']),
        });
      }

      // Each request should have fewer remaining
      expect(responses[0].remaining).toBeGreaterThan(responses[1].remaining);
      expect(responses[1].remaining).toBeGreaterThan(responses[2].remaining);
    });

    it('should track rate limits per user for authenticated requests', async () => {
      const user1 = await createTestUser('user1@example.com');
      const user2 = await createTestUser('user2@example.com');

      const token1 = authService.generateToken(user1);
      const token2 = authService.generateToken(user2);

      // Make 50 requests as user1
      for (let i = 0; i < 50; i++) {
        await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token1}`);
      }

      // User2 should still have full quota
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token2}`);

      // Since rate limits are per user, user2 should still be able to make requests
      expect(response.status).not.toBe(429);
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);

      // User2 should have almost full quota (99 remaining out of 100)
      expect(remaining).toBeGreaterThan(90);
    });
  });

  describe('Error Messages', () => {
    it('should return appropriate error message when rate limited', async () => {
      const loginData = {
        email: 'error@example.com',
        password: 'password123',
      };

      await createTestUser(loginData.email, loginData.password);

      // Exceed the limit
      for (let i = 0; i < 6; i++) {
        await request(app).post('/api/auth/login').send(loginData);
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/too many/i);
    });

    it('should use custom message for auth endpoints', async () => {
      const loginData = {
        email: 'custom@example.com',
        password: 'password123',
      };

      await createTestUser(loginData.email, loginData.password);

      // Exceed the limit
      for (let i = 0; i < 6; i++) {
        await request(app).post('/api/auth/login').send(loginData);
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.body.message).toMatch(/login attempts/i);
    });
  });

  describe('Family Creation Rate Limiting', () => {
    it('should apply strict rate limiting to family creation', async () => {
      const familyData = {
        name: 'Test Family',
        email: 'family@example.com',
        password: 'password123',
        phone: '1234567890',
        userName: 'Test User',
      };

      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/families')
          .send({ ...familyData, email: `family${i}@example.com` });
      }

      // The 6th request should be rate limited
      const response = await request(app)
        .post('/api/families')
        .send({ ...familyData, email: 'family6@example.com' });

      expect(response.status).toBe(429);
    });
  });
});
