/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Role, FamilyStatus, Family, User } from '@prisma/client';
import { clearDatabase } from './utils/db.js';
import { createTestUserWithRole } from './utils/auth-helper.js';
import { createFamilyWithMembers } from './utils/factories.js';
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

describe('Gear API', () => {
  let superAdminToken: string;
  let tripAdminToken: string;
  let tripAdminUser: User;
  let familyUserToken: string;
  let familyUser: User;
  let approvedFamily: Family & { members: User[] };
  let anotherFamily: Family & { members: User[] };
  let publishedTrip: { id: string };
  let draftTrip: { id: string };

  beforeAll(async () => {
    await clearDatabase();

    // Create super admin
    const superAdmin = await createTestUserWithRole(Role.SUPER_ADMIN);
    superAdminToken = authService.generateToken(superAdmin);

    // Create trip admin
    tripAdminUser = await createTestUserWithRole(Role.TRIP_ADMIN);
    tripAdminToken = authService.generateToken(tripAdminUser);

    // Create approved family with a family user
    approvedFamily = await createFamilyWithMembers(
      { status: FamilyStatus.APPROVED },
      [
        {
          name: 'Family User',
          email: 'family@test.com',
          password: 'password123',
        },
      ],
    );
    familyUser = approvedFamily.members[0];
    familyUserToken = authService.generateToken(familyUser);

    // Create another approved family
    anotherFamily = await createFamilyWithMembers(
      { status: FamilyStatus.APPROVED },
      [
        {
          name: 'Another Family User',
          email: 'anotherfamily@test.com',
          password: 'password123',
        },
      ],
    );

    // Create a published trip with trip admin
    publishedTrip = await prisma.trip.create({
      data: {
        name: 'Summer Camp 2024',
        location: 'Lake Tahoe',
        startDate: new Date('2026-07-15'),
        endDate: new Date('2026-07-20'),
        draft: false,
        admins: {
          connect: { id: tripAdminUser.id },
        },
      },
    });

    // Create attendance for both families
    await prisma.tripAttendance.createMany({
      data: [
        {
          tripId: publishedTrip.id,
          familyId: approvedFamily.id,
        },
        {
          tripId: publishedTrip.id,
          familyId: anotherFamily.id,
        },
      ],
    });

    // Create a draft trip
    draftTrip = await prisma.trip.create({
      data: {
        name: 'Draft Trip',
        location: 'Somewhere',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-05'),
        draft: true,
        admins: {
          connect: { id: tripAdminUser.id },
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up gear items and assignments after each test
    await prisma.gearAssignment.deleteMany({});
    await prisma.gearItem.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/gear', () => {
    it('should create a new gear item as trip admin', async () => {
      const gearData = {
        tripId: publishedTrip.id,
        name: 'Tent',
        quantityNeeded: 5,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(gearData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Tent');
      expect(res.body.quantityNeeded).toBe(5);
      expect(res.body.tripId).toBe(publishedTrip.id);
      expect(res.body.assignments).toEqual([]);
    });

    it('should create a new gear item as super admin', async () => {
      const gearData = {
        tripId: publishedTrip.id,
        name: 'Sleeping Bag',
        quantityNeeded: 10,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(gearData);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Sleeping Bag');
    });

    it('should fail to create gear item as family user', async () => {
      const gearData = {
        tripId: publishedTrip.id,
        name: 'Unauthorized Gear',
        quantityNeeded: 3,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(gearData);

      expect(res.status).toBe(403);
    });

    it('should fail with invalid quantity (0)', async () => {
      const gearData = {
        tripId: publishedTrip.id,
        name: 'Invalid Gear',
        quantityNeeded: 0,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(gearData);

      expect(res.status).toBe(400);
    });

    it('should fail with negative quantity', async () => {
      const gearData = {
        tripId: publishedTrip.id,
        name: 'Invalid Gear',
        quantityNeeded: -5,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(gearData);

      expect(res.status).toBe(400);
    });

    it('should fail with non-existent trip', async () => {
      const gearData = {
        tripId: 'non-existent-trip-id',
        name: 'Gear',
        quantityNeeded: 5,
      };

      const res = await request(app)
        .post('/api/gear')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(gearData);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/gear/trip/:tripId', () => {
    it('should get all gear items for a published trip', async () => {
      // Create some gear items
      await prisma.gearItem.createMany({
        data: [
          { tripId: publishedTrip.id, name: 'Tent', quantityNeeded: 5 },
          { tripId: publishedTrip.id, name: 'Cooler', quantityNeeded: 3 },
        ],
      });

      const res = await request(app)
        .get(`/api/gear/trip/${publishedTrip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Cooler'); // Ordered by name
      expect(res.body[1].name).toBe('Tent');
    });

    it('should get gear items for draft trip as trip admin', async () => {
      await prisma.gearItem.create({
        data: { tripId: draftTrip.id, name: 'Draft Gear', quantityNeeded: 2 },
      });

      const res = await request(app)
        .get(`/api/gear/trip/${draftTrip.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('should fail to get gear for draft trip as family user', async () => {
      const res = await request(app)
        .get(`/api/gear/trip/${draftTrip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(403);
    });

    it('should return empty array for trip with no gear', async () => {
      const newTrip = await prisma.trip.create({
        data: {
          name: 'Trip Without Gear',
          location: 'Somewhere',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .get(`/api/gear/trip/${newTrip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/gear/:id', () => {
    it('should get gear item by ID', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Fishing Rod',
          quantityNeeded: 4,
        },
      });

      const res = await request(app)
        .get(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(gearItem.id);
      expect(res.body.name).toBe('Fishing Rod');
    });

    it('should fail with non-existent gear ID', async () => {
      const res = await request(app)
        .get('/api/gear/non-existent-id')
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/gear/:id', () => {
    it('should update gear item as trip admin', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Old Name',
          quantityNeeded: 5,
        },
      });

      const updateData = {
        name: 'New Name',
        quantityNeeded: 7,
      };

      const res = await request(app)
        .put(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.quantityNeeded).toBe(7);
    });

    it('should update only name', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Old Name',
          quantityNeeded: 5,
        },
      });

      const updateData = {
        name: 'Updated Name',
      };

      const res = await request(app)
        .put(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.quantityNeeded).toBe(5); // Unchanged
    });

    it('should fail to update gear item as family user', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const res = await request(app)
        .put(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(403);
    });

    it('should fail to reduce quantity below total assigned', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 10,
        },
      });

      // Create assignment
      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 5,
        },
      });

      const res = await request(app)
        .put(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ quantityNeeded: 3 }); // Less than assigned (5)

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot reduce quantity');
    });
  });

  describe('DELETE /api/gear/:id', () => {
    it('should delete gear item as trip admin', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'To Delete',
          quantityNeeded: 5,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Gear item deleted successfully');

      // Verify deletion
      const deletedItem = await prisma.gearItem.findUnique({
        where: { id: gearItem.id },
      });
      expect(deletedItem).toBeNull();
    });

    it('should delete gear item with assignments (cascade)', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'With Assignment',
          quantityNeeded: 5,
        },
      });

      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 2,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);

      // Verify assignment was also deleted
      const assignment = await prisma.gearAssignment.findFirst({
        where: { gearItemId: gearItem.id },
      });
      expect(assignment).toBeNull();
    });

    it('should fail to delete gear item as family user', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/gear/:id/assign', () => {
    it('should assign gear to family (volunteer)', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Tent',
          quantityNeeded: 5,
        },
      });

      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(201);
      expect(res.body.quantityAssigned).toBe(2);
      expect(res.body.familyId).toBe(approvedFamily.id);
    });

    it('should update existing assignment (upsert)', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Cooler',
          quantityNeeded: 5,
        },
      });

      // Initial assignment
      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 1,
        },
      });

      // Update assignment
      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 3,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(201);
      expect(res.body.quantityAssigned).toBe(3);

      // Verify only one assignment exists
      const assignments = await prisma.gearAssignment.findMany({
        where: { gearItemId: gearItem.id, familyId: approvedFamily.id },
      });
      expect(assignments).toHaveLength(1);
    });

    it('should fail if total assigned exceeds quantity needed', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Limited Gear',
          quantityNeeded: 5,
        },
      });

      // Another family assigns 3
      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: anotherFamily.id,
          quantityAssigned: 3,
        },
      });

      // Current family tries to assign 3 (total would be 6)
      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 3,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot assign more than needed');
    });

    it('should allow family to assign up to remaining quantity', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Exact Gear',
          quantityNeeded: 5,
        },
      });

      // Another family assigns 3
      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: anotherFamily.id,
          quantityAssigned: 3,
        },
      });

      // Current family assigns remaining 2
      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(201);
    });

    it('should fail if family is not attending trip', async () => {
      // Create a new family not attending the trip
      const nonAttendingFamily = await createFamilyWithMembers(
        { status: FamilyStatus.APPROVED },
        [
          {
            name: 'Non Attending User',
            email: 'nonattending@test.com',
            password: 'password123',
          },
        ],
      );
      const nonAttendingUser = nonAttendingFamily.members[0];
      const nonAttendingToken = authService.generateToken(nonAttendingUser);

      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const assignData = {
        familyId: nonAttendingFamily.id,
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${nonAttendingToken}`)
        .send(assignData);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('must be attending');
    });

    it('should fail if family tries to assign for another family', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const assignData = {
        familyId: anotherFamily.id, // Different family
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(403);
    });

    it('should allow trip admin to assign to any family', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(assignData);

      expect(res.status).toBe(201);
    });

    it('should fail if trip has already started', async () => {
      // Create a trip that has started
      const startedTrip = await prisma.trip.create({
        data: {
          name: 'Started Trip',
          location: 'Past',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-01-05'),
          draft: false,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      await prisma.tripAttendance.create({
        data: {
          tripId: startedTrip.id,
          familyId: approvedFamily.id,
        },
      });

      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: startedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const assignData = {
        familyId: approvedFamily.id,
        quantityAssigned: 2,
      };

      const res = await request(app)
        .post(`/api/gear/${gearItem.id}/assign`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(assignData);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('after trip has started');
    });
  });

  describe('DELETE /api/gear/:id/assign/:familyId', () => {
    it('should remove gear assignment', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 2,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}/assign/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Gear assignment removed successfully');

      // Verify deletion
      const assignment = await prisma.gearAssignment.findUnique({
        where: {
          gearItemId_familyId: {
            gearItemId: gearItem.id,
            familyId: approvedFamily.id,
          },
        },
      });
      expect(assignment).toBeNull();
    });

    it('should fail if family tries to remove another family assignment', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: anotherFamily.id,
          quantityAssigned: 2,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}/assign/${anotherFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow trip admin to remove any assignment', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 2,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}/assign/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail if assignment does not exist', async () => {
      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}/assign/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(404);
    });

    it('should fail if trip has already started', async () => {
      const startedTrip = await prisma.trip.create({
        data: {
          name: 'Started Trip',
          location: 'Past',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-01-05'),
          draft: false,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      await prisma.tripAttendance.create({
        data: {
          tripId: startedTrip.id,
          familyId: approvedFamily.id,
        },
      });

      const gearItem = await prisma.gearItem.create({
        data: {
          tripId: startedTrip.id,
          name: 'Gear',
          quantityNeeded: 5,
        },
      });

      await prisma.gearAssignment.create({
        data: {
          gearItemId: gearItem.id,
          familyId: approvedFamily.id,
          quantityAssigned: 2,
        },
      });

      const res = await request(app)
        .delete(`/api/gear/${gearItem.id}/assign/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('after trip has started');
    });
  });

  describe('GET /api/gear/trip/:tripId/summary', () => {
    it('should get gear summary for a trip', async () => {
      const gear1 = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Tent',
          quantityNeeded: 5,
        },
      });

      const gear2 = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Cooler',
          quantityNeeded: 3,
        },
      });

      await prisma.gearAssignment.createMany({
        data: [
          {
            gearItemId: gear1.id,
            familyId: approvedFamily.id,
            quantityAssigned: 2,
          },
          {
            gearItemId: gear1.id,
            familyId: anotherFamily.id,
            quantityAssigned: 1,
          },
          {
            gearItemId: gear2.id,
            familyId: approvedFamily.id,
            quantityAssigned: 3,
          },
        ],
      });

      const res = await request(app)
        .get(`/api/gear/trip/${publishedTrip.id}/summary`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);

      const tentSummary = res.body.find(
        (item: { name: string }) => item.name === 'Tent',
      );
      expect(tentSummary.quantityNeeded).toBe(5);
      expect(tentSummary.totalAssigned).toBe(3);
      expect(tentSummary.assignments).toHaveLength(2);

      const coolerSummary = res.body.find(
        (item: { name: string }) => item.name === 'Cooler',
      );
      expect(coolerSummary.quantityNeeded).toBe(3);
      expect(coolerSummary.totalAssigned).toBe(3);
      expect(coolerSummary.assignments).toHaveLength(1);
    });
  });

  describe('GET /api/gear/trip/:tripId/family/:familyId', () => {
    it('should get family gear assignments', async () => {
      const gear1 = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Tent',
          quantityNeeded: 5,
        },
      });

      const gear2 = await prisma.gearItem.create({
        data: {
          tripId: publishedTrip.id,
          name: 'Cooler',
          quantityNeeded: 3,
        },
      });

      await prisma.gearAssignment.createMany({
        data: [
          {
            gearItemId: gear1.id,
            familyId: approvedFamily.id,
            quantityAssigned: 2,
          },
          {
            gearItemId: gear2.id,
            familyId: approvedFamily.id,
            quantityAssigned: 1,
          },
        ],
      });

      const res = await request(app)
        .get(`/api/gear/trip/${publishedTrip.id}/family/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should fail if family tries to view another family assignments', async () => {
      const res = await request(app)
        .get(`/api/gear/trip/${publishedTrip.id}/family/${anotherFamily.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow trip admin to view any family assignments', async () => {
      const res = await request(app)
        .get(`/api/gear/trip/${publishedTrip.id}/family/${approvedFamily.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
