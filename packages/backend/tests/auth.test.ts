import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { User, Role } from '@prisma/client';
import { clearDatabase } from './utils/db.js';
import { createTestUser } from './utils/auth-helper.js';
import { authService } from '../src/services/auth.service.js';

describe('Auth API', () => {
  // Clear database once at the beginning
  beforeAll(async () => {
    await clearDatabase();
  });

  // Clear database after each test to ensure a clean state for next test
  afterEach(async () => {
    await clearDatabase();
  });

  // One final cleanup at the end
  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User Registration',
        email: 'test.registration@example.com',
        password: 'password123',
        familyName: 'Test Family Registration',
      });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');

      // Verify user was created in the database
      const user = (await prisma.user.findUnique({
        where: { email: 'test.registration@example.com' },
      })) as User;
      
      expect(user).not.toBeNull();
      expect(user.name).toBe('Test User Registration');
      expect(user.role).toBe(Role.FAMILY);
    });

    it('should not register a user with an existing email', async () => {
      // First create a user
      await createTestUser('duplicate@example.com', 'password123');
      
      // Then try to register another user with the same email
      const res = await request(app).post('/api/auth/register').send({
        name: 'Another User',
        email: 'duplicate@example.com',
        password: 'password123',
      });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login the user and return a token', async () => {
      // Create a test user first
      await createTestUser('login-test@example.com', 'password123');
      
      // Try to login
      const res = await request(app).post('/api/auth/login').send({
        email: 'login-test@example.com',
        password: 'password123',
      });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      // Create a test user first
      await createTestUser('invalid-login@example.com', 'password123');
      
      // Try to login with wrong password
      const res = await request(app).post('/api/auth/login').send({
        email: 'invalid-login@example.com',
        password: 'wrongpassword',
      });
      
      expect(res.status).toBe(401);
    });
  });

  describe('Protected Route', () => {
    it('should allow access to a protected route with a valid token', async () => {
      // Create a test user first
      const testUser = await createTestUser('protected-test@example.com', 'password123');
      
      // Generate a valid token
      const validToken = authService.generateToken(testUser);
      
      // Try to access protected route
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validToken}`);
        
      expect(res.status).toBe(200);
    });

    it('should not allow access to a protected route without a token', async () => {
      // Try to access protected route without token
      const res = await request(app).get('/api/protected');
      
      expect(res.status).toBe(401);
    });
  });
});
