/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { Role, FamilyStatus, UserType, ActionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('Admin API', () => {
  let superAdminToken: string;
  let tripAdminToken: string;
  let familyUserToken: string;
  let superAdminId: string;
  let tripAdminId: string;
  let familyUserId: string;
  let testFamilyId: string;
  let testTripId: string;
  let pendingFamilyId: string;

  beforeAll(async () => {
    // Clean up existing test data
    await prisma.log.deleteMany({});
    await prisma.whatsAppMessage.deleteMany({});
    await prisma.tripScheduleItem.deleteMany({});
    await prisma.gearAssignment.deleteMany({});
    await prisma.gearItem.deleteMany({});
    await prisma.tripAttendance.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.family.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create super admin
    const superAdminFamily = await prisma.family.create({
      data: {
        name: 'Super Admin Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
      },
    });

    const superAdmin = await prisma.user.create({
      data: {
        familyId: superAdminFamily.id,
        type: UserType.ADULT,
        name: 'Super Admin',
        email: 'superadmin@test.com',
        passwordHash: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    });
    superAdminId = superAdmin.id;

    // Create trip admin
    const tripAdminFamily = await prisma.family.create({
      data: {
        name: 'Trip Admin Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
      },
    });

    const tripAdmin = await prisma.user.create({
      data: {
        familyId: tripAdminFamily.id,
        type: UserType.ADULT,
        name: 'Trip Admin',
        email: 'tripadmin@test.com',
        passwordHash: hashedPassword,
        role: Role.TRIP_ADMIN,
      },
    });
    tripAdminId = tripAdmin.id;

    // Create regular family user
    const familyUser = await prisma.family.create({
      data: {
        name: 'Test Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
        members: {
          create: [
            {
              type: UserType.ADULT,
              name: 'Family User',
              email: 'family@test.com',
              passwordHash: hashedPassword,
              role: Role.FAMILY,
            },
            {
              type: UserType.CHILD,
              name: 'Child User',
              email: 'child@test.com',
              age: 10,
            },
          ],
        },
      },
      include: {
        members: true,
      },
    });
    testFamilyId = familyUser.id;
    familyUserId = familyUser.members.find((m) => m.type === UserType.ADULT)!
      .id;

    // Create a pending family for approval tests
    const pendingFamily = await prisma.family.create({
      data: {
        name: 'Pending Family',
        status: FamilyStatus.PENDING,
        isActive: true,
        members: {
          create: {
            type: UserType.ADULT,
            name: 'Pending User',
            email: 'pending@test.com',
            passwordHash: hashedPassword,
          },
        },
      },
    });
    pendingFamilyId = pendingFamily.id;

    // Create test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        location: 'Test Location',
        description: 'Test Description',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        draft: true,
        admins: {
          connect: { id: tripAdminId },
        },
      },
    });
    testTripId = trip.id;

    // Login to get tokens
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@test.com', password: 'password123' });
    superAdminToken = superAdminLogin.body.tokens.accessToken;

    const tripAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tripadmin@test.com', password: 'password123' });
    tripAdminToken = tripAdminLogin.body.tokens.accessToken;

    const familyUserLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'family@test.com', password: 'password123' });
    familyUserToken = familyUserLogin.body.tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.log.deleteMany({});
    await prisma.whatsAppMessage.deleteMany({});
    await prisma.tripScheduleItem.deleteMany({});
    await prisma.gearAssignment.deleteMany({});
    await prisma.gearItem.deleteMany({});
    await prisma.tripAttendance.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.family.deleteMany({});
    await prisma.$disconnect();
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      it('should allow super admin to get all users', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter users by role', async () => {
        const response = await request(app)
          .get('/api/admin/users?role=SUPER_ADMIN')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.every((u: any) => u.role === 'SUPER_ADMIN')).toBe(true);
      });

      it('should filter users by type', async () => {
        const response = await request(app)
          .get('/api/admin/users?type=CHILD')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.every((u: any) => u.type === 'CHILD')).toBe(true);
      });

      it('should not allow trip admin to access', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${tripAdminToken}`);

        expect(response.status).toBe(403);
      });

      it('should not allow family user to access', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${familyUserToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('POST /api/admin/users/:userId/role', () => {
      it('should allow super admin to update user role', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${tripAdminId}/role`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ role: Role.FAMILY });

        expect(response.status).toBe(200);
        expect(response.body.data.role).toBe(Role.FAMILY);

        // Restore role
        await prisma.user.update({
          where: { id: tripAdminId },
          data: { role: Role.TRIP_ADMIN },
        });
      });

      it('should reject invalid role', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${tripAdminId}/role`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ role: 'INVALID_ROLE' });

        expect(response.status).toBe(400);
      });

      it('should not allow non-super admin to update roles', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${familyUserId}/role`)
          .set('Authorization', `Bearer ${tripAdminToken}`)
          .send({ role: Role.TRIP_ADMIN });

        expect(response.status).toBe(403);
      });
    });

    describe('GET /api/admin/users/:userId/logs', () => {
      it('should get activity logs for a specific user', async () => {
        const response = await request(app)
          .get(`/api/admin/users/${superAdminId}/logs`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.logs)).toBe(true);
      });
    });
  });

  describe('Family Management', () => {
    describe('GET /api/admin/families/pending', () => {
      it('should get all pending families', async () => {
        const response = await request(app)
          .get('/api/admin/families/pending')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.some((f: any) => f.id === pendingFamilyId)).toBe(true);
      });
    });

    describe('POST /api/admin/families/:familyId/approve', () => {
      it('should approve a pending family', async () => {
        const response = await request(app)
          .post(`/api/admin/families/${pendingFamilyId}/approve`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe(FamilyStatus.APPROVED);
      });

      it('should not approve already approved family', async () => {
        const response = await request(app)
          .post(`/api/admin/families/${pendingFamilyId}/approve`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/admin/families/bulk-approve', () => {
      let bulkPendingFamilies: string[];

      beforeEach(async () => {
        // Create multiple pending families with unique emails
        const timestamp = Date.now();
        const families = await Promise.all([
          prisma.family.create({
            data: {
              name: 'Bulk Pending 1',
              status: FamilyStatus.PENDING,
              members: {
                create: {
                  type: UserType.ADULT,
                  name: 'Bulk User 1',
                  email: `bulk1_${timestamp}@test.com`,
                  passwordHash: await bcrypt.hash('password', 10),
                },
              },
            },
          }),
          prisma.family.create({
            data: {
              name: 'Bulk Pending 2',
              status: FamilyStatus.PENDING,
              members: {
                create: {
                  type: UserType.ADULT,
                  name: 'Bulk User 2',
                  email: `bulk2_${timestamp}@test.com`,
                  passwordHash: await bcrypt.hash('password', 10),
                },
              },
            },
          }),
        ]);

        bulkPendingFamilies = families.map((f) => f.id);
      });

      it('should bulk approve multiple families', async () => {
        const response = await request(app)
          .post('/api/admin/families/bulk-approve')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ familyIds: bulkPendingFamilies });

        expect(response.status).toBe(200);
        expect(response.body.data.approvedIds).toHaveLength(bulkPendingFamilies.length);

        // Verify all are approved
        const families = await prisma.family.findMany({
          where: { id: { in: bulkPendingFamilies } },
        });
        expect(families.every((f) => f.status === FamilyStatus.APPROVED)).toBe(true);
      });

      it('should reject empty array', async () => {
        const response = await request(app)
          .post('/api/admin/families/bulk-approve')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ familyIds: [] });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/admin/families/:familyId/deactivate', () => {
      it('should deactivate a family', async () => {
        const response = await request(app)
          .post(`/api/admin/families/${testFamilyId}/deactivate`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.isActive).toBe(false);
      });
    });

    describe('POST /api/admin/families/:familyId/reactivate', () => {
      it('should reactivate a family', async () => {
        const response = await request(app)
          .post(`/api/admin/families/${testFamilyId}/reactivate`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.isActive).toBe(true);
      });
    });

    describe('POST /api/admin/families/bulk-deactivate', () => {
      it('should bulk deactivate multiple families', async () => {
        const familyIds = [testFamilyId];

        const response = await request(app)
          .post('/api/admin/families/bulk-deactivate')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ familyIds });

        expect(response.status).toBe(200);

        // Reactivate for other tests
        await prisma.family.update({
          where: { id: testFamilyId },
          data: { isActive: true },
        });
      });
    });

    describe('DELETE /api/admin/families/:familyId', () => {
      it('should delete a family permanently', async () => {
        const tempFamily = await prisma.family.create({
          data: {
            name: 'Temp Family',
            status: FamilyStatus.APPROVED,
            members: {
              create: {
                type: UserType.ADULT,
                name: 'Temp User',
                email: 'temp@test.com',
                passwordHash: await bcrypt.hash('password', 10),
              },
            },
          },
        });

        const response = await request(app)
          .delete(`/api/admin/families/${tempFamily.id}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);

        const deletedFamily = await prisma.family.findUnique({
          where: { id: tempFamily.id },
        });
        expect(deletedFamily).toBeNull();
      });
    });
  });

  describe('Trip Management', () => {
    describe('POST /api/admin/trips/:tripId/publish', () => {
      it('should publish a draft trip', async () => {
        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/publish`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.draft).toBe(false);
      });

      it('should not publish already published trip', async () => {
        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/publish`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/admin/trips/:tripId/unpublish', () => {
      it('should unpublish a published trip', async () => {
        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/unpublish`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.draft).toBe(true);
      });
    });

    describe('POST /api/admin/trips/:tripId/admins', () => {
      it('should assign admins to trip', async () => {
        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/admins`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ adminIds: [tripAdminId, superAdminId] });

        expect(response.status).toBe(200);
        expect(response.body.data.admins).toHaveLength(2);
      });

      it('should reject non-array adminIds', async () => {
        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/admins`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ adminIds: tripAdminId });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/admin/trips/:tripId/admins/:adminId', () => {
      it('should add an admin to trip', async () => {
        // First reset admins
        await prisma.trip.update({
          where: { id: testTripId },
          data: { admins: { set: [] } },
        });

        const response = await request(app)
          .post(`/api/admin/trips/${testTripId}/admins/${tripAdminId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.admins.some((a: any) => a.id === tripAdminId)).toBe(true);
      });
    });

    describe('DELETE /api/admin/trips/:tripId/admins/:adminId', () => {
      it('should remove an admin from trip', async () => {
        // First add another admin
        await request(app)
          .post(`/api/admin/trips/${testTripId}/admins/${superAdminId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        const response = await request(app)
          .delete(`/api/admin/trips/${testTripId}/admins/${superAdminId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE /api/admin/trips/:tripId', () => {
      it('should delete a trip permanently', async () => {
        const tempTrip = await prisma.trip.create({
          data: {
            name: 'Temp Trip',
            location: 'Temp Location',
            startDate: new Date('2025-12-15'),
            endDate: new Date('2025-12-17'),
            draft: true,
          },
        });

        const response = await request(app)
          .delete(`/api/admin/trips/${tempTrip.id}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);

        const deletedTrip = await prisma.trip.findUnique({
          where: { id: tempTrip.id },
        });
        expect(deletedTrip).toBeNull();
      });
    });
  });

  describe('Statistics and Reporting', () => {
    describe('GET /api/admin/metrics', () => {
      it('should return dashboard metrics for super admin', async () => {
        const response = await request(app)
          .get('/api/admin/metrics')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('trips');
        expect(response.body.data).toHaveProperty('families');
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('attendance');
      });

      it('should return dashboard metrics for trip admin', async () => {
        const response = await request(app)
          .get('/api/admin/metrics')
          .set('Authorization', `Bearer ${tripAdminToken}`);

        expect(response.status).toBe(200);
      });

      it('should not allow family user to access', async () => {
        const response = await request(app)
          .get('/api/admin/metrics')
          .set('Authorization', `Bearer ${familyUserToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('GET /api/admin/summary', () => {
      it('should return system summary', async () => {
        const response = await request(app)
          .get('/api/admin/summary')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('summary');
        expect(response.body.data).toHaveProperty('metrics');
      });
    });

    describe('GET /api/admin/stats/trips', () => {
      it('should return trip statistics', async () => {
        const response = await request(app)
          .get('/api/admin/stats/trips')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter by draft status', async () => {
        const response = await request(app)
          .get('/api/admin/stats/trips?draft=true')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.every((t: any) => t.draft === true)).toBe(true);
      });
    });

    describe('GET /api/admin/stats/families', () => {
      it('should return family statistics', async () => {
        const response = await request(app)
          .get('/api/admin/stats/families')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter by status', async () => {
        const response = await request(app)
          .get('/api/admin/stats/families?status=APPROVED')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.every((f: any) => f.status === 'APPROVED')).toBe(true);
      });
    });

    describe('GET /api/admin/reports/trips/:tripId/attendance', () => {
      it('should return trip attendance report', async () => {
        const response = await request(app)
          .get(`/api/admin/reports/trips/${testTripId}/attendance`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('tripId');
        expect(response.body.data).toHaveProperty('tripName');
        expect(response.body.data).toHaveProperty('stats');
        expect(response.body.data).toHaveProperty('attendees');
      });
    });
  });

  describe('Activity Logs', () => {
    describe('GET /api/admin/logs', () => {
      it('should return all activity logs', async () => {
        const response = await request(app)
          .get('/api/admin/logs')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('logs');
        expect(response.body.data).toHaveProperty('totalCount');
        expect(Array.isArray(response.body.data.logs)).toBe(true);
      });

      it('should filter by action type', async () => {
        const response = await request(app)
          .get(`/api/admin/logs?actionType=${ActionType.LOGIN}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(
          response.body.data.logs.every((l: any) => l.actionType === ActionType.LOGIN)
        ).toBe(true);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/admin/logs?limit=5&offset=0')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.limit).toBe(5);
        expect(response.body.data.offset).toBe(0);
      });
    });

    describe('GET /api/admin/logs/:entityType/:entityId', () => {
      it('should return logs for a specific entity', async () => {
        const response = await request(app)
          .get(`/api/admin/logs/Trip/${testTripId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data.logs)).toBe(true);
      });
    });
  });

  describe('Data Export', () => {
    describe('POST /api/admin/export', () => {
      it('should export all data by default', async () => {
        const response = await request(app)
          .post('/api/admin/export')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({});

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('exportedAt');
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('families');
        expect(response.body.data).toHaveProperty('trips');
        expect(response.body.data).toHaveProperty('attendance');
      });

      it('should export only selected data', async () => {
        const response = await request(app)
          .post('/api/admin/export')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            includeUsers: true,
            includeFamilies: false,
            includeTrips: false,
            includeLogs: false,
            includeAttendance: false,
            includeGear: false,
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).not.toHaveProperty('trips');
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .post('/api/admin/export')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            startDate: '2025-01-01',
            endDate: '2025-12-31',
          });

        expect(response.status).toBe(200);
        expect(response.body.data.filters).toHaveProperty('startDate');
        expect(response.body.data.filters).toHaveProperty('endDate');
      });

      it('should not allow non-super admin to export', async () => {
        const response = await request(app)
          .post('/api/admin/export')
          .set('Authorization', `Bearer ${tripAdminToken}`)
          .send({});

        expect(response.status).toBe(403);
      });
    });
  });

  describe('Access Control', () => {
    it('should require authentication for all admin endpoints', async () => {
      // Test GET endpoints
      const getUsersResponse = await request(app).get('/api/admin/users');
      expect(getUsersResponse.status).toBe(401);

      const getMetricsResponse = await request(app).get('/api/admin/metrics');
      expect(getMetricsResponse.status).toBe(401);

      const getLogsResponse = await request(app).get('/api/admin/logs');
      expect(getLogsResponse.status).toBe(401);

      // Test POST endpoints
      const postExportResponse = await request(app).post('/api/admin/export');
      expect(postExportResponse.status).toBe(401);
    });

    it('should enforce role-based access control', async () => {
      // Family user should not access any admin endpoints
      const familyResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${familyUserToken}`);
      expect(familyResponse.status).toBe(403);

      // Trip admin should not access super admin endpoints
      const tripAdminResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${tripAdminToken}`);
      expect(tripAdminResponse.status).toBe(403);

      // Super admin should access all endpoints
      const superAdminResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(superAdminResponse.status).toBe(200);
    });
  });
});
