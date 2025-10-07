import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { Role, UserType } from '@prisma/client';
import { clearDatabase } from './utils/db.js';
import { createTestUserWithRole } from './utils/auth-helper.js';
import { createFamilyWithMembers, createFamily, createAdult, createChild } from './utils/factories.js';
import { authService } from '../src/services/auth.service.js';

// Mock the logging service
vi.mock('../src/services/log.service.js', () => ({
  logService: {
    log: vi.fn().mockResolvedValue({}),
    logUserAction: vi.fn().mockResolvedValue({}),
    logLogin: vi.fn().mockResolvedValue({}),
    logOAuthLogin: vi.fn().mockResolvedValue({}),
  },
  __esModule: true,
}));

describe('Family API', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/families', () => {
    it('should create a new family with adults and children', async () => {
      const passwordHash = await authService.hashPassword('password123');
      
      const res = await request(app)
        .post('/api/families')
        .send({
          name: 'Smith Family',
          adults: [
            {
              name: 'John Smith',
              email: 'john@smith.com',
              passwordHash,
            },
            {
              name: 'Jane Smith',
              email: 'jane@smith.com',
              passwordHash,
            },
          ],
          children: [
            { name: 'Tommy Smith', age: 8 },
            { name: 'Sarah Smith', age: 5 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Smith Family');
      expect(res.body.members).toHaveLength(4);

      // Verify adults
      const adults = res.body.members.filter((m: any) => m.type === UserType.ADULT);
      expect(adults).toHaveLength(2);

      // Verify children
      const children = res.body.members.filter((m: any) => m.type === UserType.CHILD);
      expect(children).toHaveLength(2);
    });

    it('should fail if no adults are provided', async () => {
      const res = await request(app)
        .post('/api/families')
        .send({
          name: 'Invalid Family',
          adults: [],
          children: [{ name: 'Tommy', age: 8 }],
        });

      expect(res.status).toBe(400);
    });

    it('should fail if adult email already exists', async () => {
      const passwordHash = await authService.hashPassword('password123');
      
      // Create first family
      await request(app)
        .post('/api/families')
        .send({
          name: 'First Family',
          adults: [{ name: 'John', email: 'duplicate@test.com', passwordHash }],
        });

      // Try to create second family with same email
      const res = await request(app)
        .post('/api/families')
        .send({
          name: 'Second Family',
          adults: [{ name: 'Jane', email: 'duplicate@test.com', passwordHash }],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email already exists');
    });
  });

  describe('GET /api/families', () => {
    it('should allow SUPER_ADMIN to get all families', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      // Create test families
      await createFamilyWithMembers({ name: 'Family 1' });
      await createFamilyWithMembers({ name: 'Family 2' });

      const res = await request(app)
        .get('/api/families')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3); // 2 test families + superAdmin's family
    });

    it('should allow FAMILY to get only their own family', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      // Create another family
      await createFamilyWithMembers({ name: 'Other Family' });

      const res = await request(app)
        .get('/api/families')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(familyUser.familyId);
    });

    it('should filter families by status', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      // Create families with different statuses
      const pendingFamily = await createFamilyWithMembers({ name: 'Pending Family' });
      
      // Approve one family
      await prisma.family.update({
        where: { id: pendingFamily.id },
        data: { status: 'APPROVED' },
      });

      const res = await request(app)
        .get('/api/families?status=APPROVED')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.every((f: any) => f.status === 'APPROVED')).toBe(true);
    });

    it('should filter families by active status', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      // Create families
      const activeFamily = await createFamilyWithMembers({ name: 'Active Family' });
      const inactiveFamily = await createFamilyWithMembers({ name: 'Inactive Family' });
      
      // Deactivate one family
      await prisma.family.update({
        where: { id: inactiveFamily.id },
        data: { isActive: false },
      });

      const res = await request(app)
        .get('/api/families?isActive=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.every((f: any) => f.isActive === true)).toBe(true);
    });
  });

  describe('GET /api/families/:id', () => {
    it('should get family by ID', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Test Family' });

      const res = await request(app)
        .get(`/api/families/${family.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(family.id);
      expect(res.body.name).toBe('Test Family');
      expect(res.body.members).toBeDefined();
    });

    it('should not allow FAMILY to access other families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const otherFamily = await createFamilyWithMembers({ name: 'Other Family' });

      const res = await request(app)
        .get(`/api/families/${otherFamily.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const res = await request(app)
        .get('/api/families/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/families/:id', () => {
    it('should allow SUPER_ADMIN to update any family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Original Name' });

      const res = await request(app)
        .put(`/api/families/${family.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('should allow FAMILY to update their own family', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .put(`/api/families/${familyUser.familyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Family Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('My Family Name');
    });

    it('should not allow FAMILY to update other families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const otherFamily = await createFamilyWithMembers({ name: 'Other Family' });

      const res = await request(app)
        .put(`/api/families/${otherFamily.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/families/:id/approve', () => {
    it('should allow SUPER_ADMIN to approve pending family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Pending Family' });

      const res = await request(app)
        .post(`/api/families/${family.id}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('APPROVED');
    });

    it('should not allow FAMILY role to approve families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const family = await createFamilyWithMembers({ name: 'Pending Family' });

      const res = await request(app)
        .post(`/api/families/${family.id}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should fail if family is already approved', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Approved Family' });
      await prisma.family.update({
        where: { id: family.id },
        data: { status: 'APPROVED' },
      });

      const res = await request(app)
        .post(`/api/families/${family.id}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already approved');
    });
  });

  describe('POST /api/families/:id/deactivate', () => {
    it('should allow SUPER_ADMIN to deactivate family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Active Family' });

      const res = await request(app)
        .post(`/api/families/${family.id}/deactivate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(false);
    });

    it('should not allow FAMILY role to deactivate families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .post(`/api/families/${familyUser.familyId}/deactivate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/families/:id/reactivate', () => {
    it('should allow SUPER_ADMIN to reactivate family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'Inactive Family', isActive: false });

      const res = await request(app)
        .post(`/api/families/${family.id}/reactivate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(true);
    });
  });

  describe('DELETE /api/families/:id', () => {
    it('should allow SUPER_ADMIN to delete family', async () => {
      const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
      const token = authService.generateToken(superAdmin);

      const family = await createFamilyWithMembers({ name: 'To Delete' });

      const res = await request(app)
        .delete(`/api/families/${family.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify deletion
      const deletedFamily = await prisma.family.findUnique({
        where: { id: family.id },
      });
      expect(deletedFamily).toBeNull();
    });

    it('should not allow FAMILY role to delete families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .delete(`/api/families/${familyUser.familyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/families/:id/members', () => {
    it('should allow FAMILY to add adult to their own family', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const passwordHash = await authService.hashPassword('password123');

      const res = await request(app)
        .post(`/api/families/${familyUser.familyId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: UserType.ADULT,
          name: 'New Adult',
          email: 'newadult@test.com',
          passwordHash,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Adult');
      expect(res.body.type).toBe(UserType.ADULT);
    });

    it('should allow FAMILY to add child to their own family', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .post(`/api/families/${familyUser.familyId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: UserType.CHILD,
          name: 'New Child',
          age: 7,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Child');
      expect(res.body.type).toBe(UserType.CHILD);
      expect(res.body.age).toBe(7);
    });

    it('should not allow FAMILY to add members to other families', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const otherFamily = await createFamilyWithMembers({ name: 'Other Family' });

      const res = await request(app)
        .post(`/api/families/${otherFamily.id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: UserType.CHILD,
          name: 'Hacker Child',
          age: 10,
        });

      expect(res.status).toBe(403);
    });

    it('should fail if adult member has no email', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .post(`/api/families/${familyUser.familyId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: UserType.ADULT,
          name: 'Invalid Adult',
        });

      expect(res.status).toBe(400);
    });

    it('should fail if child member has no age', async () => {
      const familyUser = await createTestUserWithRole(Role.FAMILY);
      const token = authService.generateToken(familyUser);

      const res = await request(app)
        .post(`/api/families/${familyUser.familyId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: UserType.CHILD,
          name: 'Invalid Child',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/families/:id/members/:memberId', () => {
    it('should allow FAMILY to update member in their own family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Adult', email: 'adult@test.com' }],
        [{ name: 'Child', age: 8 }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);
      const child = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.CHILD },
      });

      const res = await request(app)
        .put(`/api/families/${family.id}/members/${child!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Child', age: 9 });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Child');
      expect(res.body.age).toBe(9);
    });

    it('should not allow updating member from different family', async () => {
      const family1 = await createFamilyWithMembers(
        { name: 'Family 1' },
        [{ name: 'Adult 1', email: 'adult1@test.com' }]
      );
      
      const family2 = await createFamilyWithMembers(
        { name: 'Family 2' },
        [{ name: 'Adult 2', email: 'adult2@test.com' }]
      );
      
      const adult1 = await prisma.user.findFirst({
        where: { familyId: family1.id, type: UserType.ADULT },
      });
      
      const adult2 = await prisma.user.findFirst({
        where: { familyId: family2.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult1!);

      const res = await request(app)
        .put(`/api/families/${family1.id}/members/${adult2!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/families/:id/members/:memberId', () => {
    it('should allow removing child from family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Adult', email: 'adult@test.com' }],
        [{ name: 'Child', age: 8 }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);
      const child = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.CHILD },
      });

      const res = await request(app)
        .delete(`/api/families/${family.id}/members/${child!.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed successfully');
    });

    it('should not allow removing the last adult from family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Only Adult', email: 'only@test.com' }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);

      const res = await request(app)
        .delete(`/api/families/${family.id}/members/${adult!.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('last adult');
    });
  });

  describe('GET /api/families/:id/members', () => {
    it('should get all members of a family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Adult 1', email: 'adult1@test.com' }, { name: 'Adult 2', email: 'adult2@test.com' }],
        [{ name: 'Child 1', age: 8 }, { name: 'Child 2', age: 5 }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);

      const res = await request(app)
        .get(`/api/families/${family.id}/members`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(4);
    });
  });

  describe('GET /api/families/:id/adults', () => {
    it('should get only adults of a family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Adult 1', email: 'adult1@test.com' }, { name: 'Adult 2', email: 'adult2@test.com' }],
        [{ name: 'Child 1', age: 8 }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);

      const res = await request(app)
        .get(`/api/families/${family.id}/adults`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((m: any) => m.type === UserType.ADULT)).toBe(true);
    });
  });

  describe('GET /api/families/:id/children', () => {
    it('should get only children of a family', async () => {
      const family = await createFamilyWithMembers(
        { name: 'Test Family' },
        [{ name: 'Adult', email: 'adult@test.com' }],
        [{ name: 'Child 1', age: 8 }, { name: 'Child 2', age: 5 }]
      );
      
      const adult = await prisma.user.findFirst({
        where: { familyId: family.id, type: UserType.ADULT },
      });
      
      const token = authService.generateToken(adult!);

      const res = await request(app)
        .get(`/api/families/${family.id}/children`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((m: any) => m.type === UserType.CHILD)).toBe(true);
    });
  });
});
