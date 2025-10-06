import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { User, Role } from '@prisma/client';
import { clearDatabase } from './utils/db.js';
import { createTestUser, createTestUserWithRole } from './utils/auth-helper.js';
import { authService } from '../src/services/auth.service.js';

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

// Mock OAuth middleware
vi.mock('../src/middleware/oauth.middleware.js', () => ({
  default: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    authenticate: (_strategy: string) => (req: Request, res: Response, next: () => void) => next(),
  },
  __esModule: true,
}));

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
  
  describe('Admin Creation', () => {
    it('should allow SUPER_ADMIN to create a TRIP_ADMIN user', async () => {
      // Create a super admin user
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      
      // Generate token for super admin
      const superAdminToken = authService.generateToken(superAdmin);
      
      // Test creating a TRIP_ADMIN user
      const res = await request(app)
        .post('/api/auth/admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'New Trip Admin',
          email: 'trip-admin-test@example.com',
          password: 'password123',
          familyName: 'Trip Admin Family',
          role: Role.TRIP_ADMIN,
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('email', 'trip-admin-test@example.com');
      
      // Verify user was created with correct role
      const createdAdmin = await prisma.user.findUnique({
        where: { email: 'trip-admin-test@example.com' },
      });
      
      expect(createdAdmin).not.toBeNull();
      expect(createdAdmin?.role).toBe(Role.TRIP_ADMIN);
    });
    
    it('should not allow FAMILY role to create admin users', async () => {
      // Create a family user
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      
      // Generate token for family user
      const familyToken = authService.generateToken(familyUser);
      
      // Try to create a TRIP_ADMIN user with FAMILY role
      const res = await request(app)
        .post('/api/auth/admin')
        .set('Authorization', `Bearer ${familyToken}`)
        .send({
          name: 'Unauthorized Admin',
          email: 'unauthorized@example.com',
          password: 'password123',
          role: Role.TRIP_ADMIN,
        });
      
      // Should be forbidden
      expect(res.status).toBe(403);
      
      // Verify user was not created
      const notCreated = await prisma.user.findUnique({
        where: { email: 'unauthorized@example.com' },
      });
      
      expect(notCreated).toBeNull();
    });
    
    it('should not allow TRIP_ADMIN to create SUPER_ADMIN users', async () => {
      // Create a trip admin user
      const tripAdmin = await createTestUserWithRole(Role.TRIP_ADMIN);
      
      // Generate token for trip admin
      const tripAdminToken = authService.generateToken(tripAdmin);
      
      // Try to create a SUPER_ADMIN user with TRIP_ADMIN role
      const res = await request(app)
        .post('/api/auth/admin')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          name: 'Unauthorized Super Admin',
          email: 'super-admin-test@example.com',
          password: 'password123',
          role: Role.SUPER_ADMIN,
        });
      
      // Should be forbidden
      expect(res.status).toBe(403);
      
      // Verify user was not created
      const notCreated = await prisma.user.findUnique({
        where: { email: 'super-admin-test@example.com' },
      });
      
      expect(notCreated).toBeNull();
    });
  });
  
  describe('Role-based Access Control', () => {
    // Test route accessible by all authenticated users
    it('should allow all authenticated users to access /role-protected/all', async () => {
      // Create test users with different roles
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const tripAdminUser = await createTestUserWithRole(Role.TRIP_ADMIN);
      const superAdminUser = await createTestUserWithRole(Role.SUPER_ADMIN);
      
      // Generate tokens for each user
      const familyToken = authService.generateToken(familyUser);
      const tripAdminToken = authService.generateToken(tripAdminUser);
      const superAdminToken = authService.generateToken(superAdminUser);
      
      // Test access for FAMILY role
      let res = await request(app)
        .get('/api/role-protected/all')
        .set('Authorization', `Bearer ${familyToken}`);
      expect(res.status).toBe(200);
      
      // Test access for TRIP_ADMIN role
      res = await request(app)
        .get('/api/role-protected/all')
        .set('Authorization', `Bearer ${tripAdminToken}`);
      expect(res.status).toBe(200);
      
      // Test access for SUPER_ADMIN role
      res = await request(app)
        .get('/api/role-protected/all')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
    });
    
    // Test route accessible only by FAMILY role
    it('should only allow FAMILY role to access /role-protected/family', async () => {
      // Create test users with different roles
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const tripAdminUser = await createTestUserWithRole(Role.TRIP_ADMIN);
      const superAdminUser = await createTestUserWithRole(Role.SUPER_ADMIN);
      
      // Generate tokens for each user
      const familyToken = authService.generateToken(familyUser);
      const tripAdminToken = authService.generateToken(tripAdminUser);
      const superAdminToken = authService.generateToken(superAdminUser);
      
      // Test access for FAMILY role - should succeed
      let res = await request(app)
        .get('/api/role-protected/family')
        .set('Authorization', `Bearer ${familyToken}`);
      expect(res.status).toBe(200);
      
      // Test access for TRIP_ADMIN role - should fail
      res = await request(app)
        .get('/api/role-protected/family')
        .set('Authorization', `Bearer ${tripAdminToken}`);
      expect(res.status).toBe(403);
      
      // Test access for SUPER_ADMIN role - should fail
      res = await request(app)
        .get('/api/role-protected/family')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(403);
    });
    
    // Test route accessible by admin roles
    it('should only allow TRIP_ADMIN and SUPER_ADMIN roles to access /role-protected/admin', async () => {
      // Create test users with different roles
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const tripAdminUser = await createTestUserWithRole(Role.TRIP_ADMIN);
      const superAdminUser = await createTestUserWithRole(Role.SUPER_ADMIN);
      
      // Generate tokens for each user
      const familyToken = authService.generateToken(familyUser);
      const tripAdminToken = authService.generateToken(tripAdminUser);
      const superAdminToken = authService.generateToken(superAdminUser);
      
      // Test access for FAMILY role - should fail
      let res = await request(app)
        .get('/api/role-protected/admin')
        .set('Authorization', `Bearer ${familyToken}`);
      expect(res.status).toBe(403);
      
      // Test access for TRIP_ADMIN role - should succeed
      res = await request(app)
        .get('/api/role-protected/admin')
        .set('Authorization', `Bearer ${tripAdminToken}`);
      expect(res.status).toBe(200);
      
      // Test access for SUPER_ADMIN role - should succeed
      res = await request(app)
        .get('/api/role-protected/admin')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
    });
    
    // Test route accessible only by SUPER_ADMIN role
    it('should only allow SUPER_ADMIN role to access /role-protected/super-admin', async () => {
      // Create test users with different roles
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const tripAdminUser = await createTestUserWithRole(Role.TRIP_ADMIN);
      const superAdminUser = await createTestUserWithRole(Role.SUPER_ADMIN);
      
      // Generate tokens for each user
      const familyToken = authService.generateToken(familyUser);
      const tripAdminToken = authService.generateToken(tripAdminUser);
      const superAdminToken = authService.generateToken(superAdminUser);
      
      // Test access for FAMILY role - should fail
      let res = await request(app)
        .get('/api/role-protected/super-admin')
        .set('Authorization', `Bearer ${familyToken}`);
      expect(res.status).toBe(403);
      
      // Test access for TRIP_ADMIN role - should fail
      res = await request(app)
        .get('/api/role-protected/super-admin')
        .set('Authorization', `Bearer ${tripAdminToken}`);
      expect(res.status).toBe(403);
      
      // Test access for SUPER_ADMIN role - should succeed
      res = await request(app)
        .get('/api/role-protected/super-admin')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
