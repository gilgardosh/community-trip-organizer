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
import { Role, FamilyStatus } from '@prisma/client';
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

describe('Trip API', () => {
  let superAdminToken: string;
  let tripAdminToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tripAdminUser: any;
  let familyUserToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let familyUser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let approvedFamily: any;

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
  });

  afterEach(async () => {
    // Clean up trips after each test
    await prisma.tripAttendance.deleteMany({});
    await prisma.gearAssignment.deleteMany({});
    await prisma.gearItem.deleteMany({});
    await prisma.trip.deleteMany({});
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/trips', () => {
    it('should create a new trip in draft mode (TRIP_ADMIN)', async () => {
      const tripData = {
        name: 'Summer Camp 2024',
        location: 'Lake Tahoe',
        description: 'Annual summer camping trip',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-20'),
        attendanceCutoffDate: new Date('2024-07-01'),
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(tripData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Summer Camp 2024');
      expect(res.body.location).toBe('Lake Tahoe');
      expect(res.body.draft).toBe(true); // Should be draft by default
      expect(res.body.admins).toEqual([]); // No admins initially
    });

    it('should create a new trip in draft mode (SUPER_ADMIN)', async () => {
      const tripData = {
        name: 'Winter Retreat 2024',
        location: 'Aspen',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-20'),
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(tripData);

      expect(res.status).toBe(201);
      expect(res.body.draft).toBe(true);
    });

    it('should fail to create trip as FAMILY user', async () => {
      const tripData = {
        name: 'Unauthorized Trip',
        location: 'Somewhere',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-05'),
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send(tripData);

      expect(res.status).toBe(403);
    });

    it('should fail if end date is before start date', async () => {
      const tripData = {
        name: 'Invalid Trip',
        location: 'Nowhere',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-05'), // Before start date
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(tripData);

      expect(res.status).toBe(400);
    });

    it('should fail if attendance cutoff is after start date', async () => {
      const tripData = {
        name: 'Invalid Cutoff Trip',
        location: 'Somewhere',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-15'),
        attendanceCutoffDate: new Date('2024-08-12'), // After start date
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send(tripData);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/trips', () => {
    it('should return all published trips for FAMILY users', async () => {
      // Create draft trip (won't be visible)
      await prisma.trip.create({
        data: {
          name: 'Draft Trip',
          location: 'Somewhere',
          startDate: new Date('2025-09-01'), // Future date
          endDate: new Date('2025-09-05'),
          draft: true,
        },
      });

      // Create published trip
      const publishedTrip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Elsewhere',
          startDate: new Date('2025-10-01'), // Future date
          endDate: new Date('2025-10-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .get('/api/trips?includePast=true')
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(publishedTrip.id);
    });

    it('should return trips managed by TRIP_ADMIN', async () => {
      // Create trip with this trip admin
      const adminTrip = await prisma.trip.create({
        data: {
          name: 'Admin Trip',
          location: 'Admin Location',
          startDate: new Date('2025-09-01'), // Future date
          endDate: new Date('2025-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      // Create trip without this admin
      await prisma.trip.create({
        data: {
          name: 'Other Trip',
          location: 'Other Location',
          startDate: new Date('2025-10-01'), // Future date
          endDate: new Date('2025-10-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .get('/api/trips?includePast=true')
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(adminTrip.id);
    });

    it('should return all trips for SUPER_ADMIN', async () => {
      await prisma.trip.createMany({
        data: [
          {
            name: 'Trip 1',
            location: 'Location 1',
            startDate: new Date('2025-09-01'), // Future date
            endDate: new Date('2025-09-05'),
            draft: true,
          },
          {
            name: 'Trip 2',
            location: 'Location 2',
            startDate: new Date('2025-10-01'), // Future date
            endDate: new Date('2025-10-05'),
            draft: false,
          },
        ],
      });

      const res = await request(app)
        .get('/api/trips?includePast=true')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('should get trip by ID (SUPER_ADMIN)', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip',
          location: 'Test Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(trip.id);
    });

    it('should fail to get draft trip as FAMILY user', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Draft Trip',
          location: 'Test Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(403);
    });

    it('should get published trip as FAMILY user', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Test Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(trip.id);
    });
  });

  describe('PUT /api/trips/:id', () => {
    it('should update trip as SUPER_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Original Name',
          location: 'Original Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Updated Name',
          location: 'Updated Location',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.location).toBe('Updated Location');
    });

    it('should update trip as assigned TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Admin Trip',
          location: 'Location',
          startDate: new Date('2026-09-01'), // Future date (well in future)
          endDate: new Date('2026-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ name: 'Updated by Admin' });

      if (res.status !== 200) {
        console.log('Error response:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated by Admin');
    });

    it('should fail to update trip as non-assigned TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Other Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ name: 'Unauthorized Update' });

      expect(res.status).toBe(403);
    });

    it('should fail to update trip as FAMILY user', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({ name: 'Family Update' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/trips/:id/publish', () => {
    it('should publish trip as SUPER_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Draft Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/publish`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.draft).toBe(false);
    });

    it('should fail to publish trip without admins', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'No Admin Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/publish`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
    });

    it('should fail to publish as TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/publish`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/trips/:id/unpublish', () => {
    it('should unpublish trip as SUPER_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/unpublish`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.draft).toBe(true);
    });

    it('should fail to unpublish as TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/unpublish`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Admin assignment', () => {
    it('should assign admins to trip (SUPER_ADMIN)', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}/admins`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ adminIds: [tripAdminUser.id] });

      expect(res.status).toBe(200);
      expect(res.body.admins).toHaveLength(1);
      expect(res.body.admins[0].id).toBe(tripAdminUser.id);
    });

    it('should add admin to trip (SUPER_ADMIN)', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/admins/${tripAdminUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.admins).toHaveLength(1);
      expect(res.body.admins[0].id).toBe(tripAdminUser.id);
    });

    it('should remove admin from trip (SUPER_ADMIN)', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}/admins/${tripAdminUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.admins).toHaveLength(0);
    });

    it('should fail to remove last admin from published trip', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}/admins/${tripAdminUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/trips/:id/attendance', () => {
    it('should mark family attendance as FAMILY user (own family)', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Location',
          startDate: new Date('2026-09-01'), // Future date (well in future)
          endDate: new Date('2026-09-05'),
          draft: false,
          attendanceCutoffDate: new Date('2026-08-25'), // Future date
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: true,
        });

      if (res.status !== 200) {
        console.log('Attendance error:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.attendees).toHaveLength(1);
      expect(res.body.attendees[0].familyId).toBe(approvedFamily.id);
    });

    it('should fail to mark attendance for other family as FAMILY user', async () => {
      const otherFamily = await createFamilyWithMembers(
        { status: FamilyStatus.APPROVED },
        [
          {
            name: 'Other User',
            email: 'other@test.com',
            password: 'password123',
          },
        ],
      );

      const trip = await prisma.trip.create({
        data: {
          name: 'Published Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({
          familyId: otherFamily.id,
          attending: true,
        });

      expect(res.status).toBe(403);
    });

    it('should mark attendance for any family as TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Admin Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: true,
        });

      expect(res.status).toBe(200);
    });

    it('should fail to mark attendance for draft trip', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Draft Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: true,
        });

      expect(res.status).toBe(400);
    });

    it('should fail to mark attendance after cutoff date', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
          attendanceCutoffDate: new Date('2020-01-01'), // Past date
        },
      });

      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: true,
        });

      expect(res.status).toBe(400);
    });

    it('should remove attendance when attending is false', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
        },
      });

      // First mark as attending
      await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: true,
        });

      // Then remove attendance
      const res = await request(app)
        .post(`/api/trips/${trip.id}/attendance`)
        .set('Authorization', `Bearer ${familyUserToken}`)
        .send({
          familyId: approvedFamily.id,
          attending: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.attendees).toHaveLength(0);
    });
  });

  describe('GET /api/trips/:id/attendees', () => {
    it('should get trip attendees', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: false,
          attendees: {
            create: {
              familyId: approvedFamily.id,
            },
          },
        },
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}/attendees`)
        .set('Authorization', `Bearer ${familyUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].familyId).toBe(approvedFamily.id);
    });
  });

  describe('DELETE /api/trips/:id', () => {
    it('should delete trip as SUPER_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip to Delete',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
        },
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const deleted = await prisma.trip.findUnique({
        where: { id: trip.id },
      });
      expect(deleted).toBeNull();
    });

    it('should fail to delete trip as TRIP_ADMIN', async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          location: 'Location',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          draft: true,
          admins: {
            connect: { id: tripAdminUser.id },
          },
        },
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(res.status).toBe(403);
    });
  });
});
