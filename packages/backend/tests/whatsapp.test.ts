import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import {
  Role,
  UserType,
  FamilyStatus,
  MessageEventType,
  MessageTriggerType,
  ActionType,
} from '@prisma/client';
import { authService } from '../src/services/auth.service.js';

// Mock the logging service to avoid issues
vi.mock('../src/services/log.service.js', () => ({
  logService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

describe('WhatsApp Message Generation', () => {
  let superAdminToken: string;
  let tripAdminToken: string;
  let familyToken: string;
  let superAdminId: string;
  let tripAdminId: string;
  let tripId: string;
  let templateId: string;

  beforeAll(async () => {
    // Clean up existing data
    await prisma.whatsAppMessage.deleteMany();
    await prisma.whatsAppMessageTemplate.deleteMany();
    await prisma.log.deleteMany();
    await prisma.tripAttendance.deleteMany();
    await prisma.gearAssignment.deleteMany();
    await prisma.gearItem.deleteMany();
    await prisma.tripScheduleItem.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();
    await prisma.family.deleteMany();

    // Create test families
    const superAdminFamily = await prisma.family.create({
      data: {
        name: 'Super Admin Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
      },
    });

    const tripAdminFamily = await prisma.family.create({
      data: {
        name: 'Trip Admin Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
      },
    });

    const regularFamily = await prisma.family.create({
      data: {
        name: 'Regular Family',
        status: FamilyStatus.APPROVED,
        isActive: true,
      },
    });

    // Create test users
    const hashedPassword = await authService.hashPassword('password123');

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

    const familyUser = await prisma.user.create({
      data: {
        familyId: regularFamily.id,
        type: UserType.ADULT,
        name: 'Family User',
        email: 'family@test.com',
        passwordHash: hashedPassword,
        role: Role.FAMILY,
      },
    });

    superAdminId = superAdmin.id;
    tripAdminId = tripAdmin.id;

    // Login and get tokens
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@test.com', password: 'password123' });
    superAdminToken = superAdminLogin.body.tokens.accessToken;

    const tripAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tripadmin@test.com', password: 'password123' });
    tripAdminToken = tripAdminLogin.body.tokens.accessToken;

    const familyLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'family@test.com', password: 'password123' });
    familyToken = familyLogin.body.tokens.accessToken;

    // Create a test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        location: 'Test Location',
        description: 'Test Description',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        attendanceCutoffDate: new Date('2025-11-15'),
        draft: false,
        admins: {
          connect: [{ id: tripAdminId }],
        },
      },
    });

    tripId = trip.id;

    // Add some attendees
    await prisma.tripAttendance.create({
      data: {
        tripId,
        familyId: regularFamily.id,
        dietaryRequirements: 'Vegetarian',
      },
    });

    // Add some gear items
    const gearItem = await prisma.gearItem.create({
      data: {
        tripId,
        name: 'Tent',
        quantityNeeded: 5,
      },
    });

    await prisma.gearAssignment.create({
      data: {
        gearItemId: gearItem.id,
        familyId: regularFamily.id,
        quantityAssigned: 2,
      },
    });

    // Add schedule items
    await prisma.tripScheduleItem.create({
      data: {
        tripId,
        day: 1,
        startTime: '09:00',
        endTime: '12:00',
        title: 'Morning Activity',
        location: 'Beach',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.whatsAppMessage.deleteMany();
    await prisma.whatsAppMessageTemplate.deleteMany();
    await prisma.log.deleteMany();
    await prisma.tripAttendance.deleteMany();
    await prisma.gearAssignment.deleteMany();
    await prisma.gearItem.deleteMany();
    await prisma.tripScheduleItem.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();
    await prisma.family.deleteMany();
    await prisma.$disconnect();
  });

  describe('Template Management', () => {
    it('should allow super admin to create a template', async () => {
      const response = await request(app)
        .post('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Trip Created Template',
          eventType: MessageEventType.TRIP_CREATED,
          content:
            'טיול חדש נוצר: {tripName} ב{location}\nתאריכים: {startDate} - {endDate}',
          description: 'Template for trip creation notifications',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Trip Created Template');
      expect(response.body.eventType).toBe(MessageEventType.TRIP_CREATED);
      expect(response.body.isActive).toBe(true);

      templateId = response.body.id;
    });

    it('should prevent trip admin from creating templates', async () => {
      const response = await request(app)
        .post('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          name: 'Another Template',
          eventType: MessageEventType.TRIP_REMINDER,
          content: 'Test content',
        });

      expect(response.status).toBe(403);
    });

    it('should allow trip admin to view templates', async () => {
      const response = await request(app)
        .get('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow super admin to update a template', async () => {
      const response = await request(app)
        .put(`/api/whatsapp/templates/${templateId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          content: 'טיול חדש! {tripName} ב{location}',
          isActive: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('טיול חדש! {tripName} ב{location}');
    });

    it('should prevent duplicate template names', async () => {
      const response = await request(app)
        .post('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Trip Created Template', // Duplicate name
          eventType: MessageEventType.TRIP_PUBLISHED,
          content: 'Test content',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Message Generation', () => {
    beforeEach(async () => {
      // Create templates for different event types
      const templates = [
        {
          name: 'Trip Published',
          eventType: MessageEventType.TRIP_PUBLISHED,
          content:
            'הטיול {tripName} פורסם!\nמיקום: {location}\nתאריכים: {startDate} - {endDate}\nמועד אחרון להרשמה: {cutoffDate}',
        },
        {
          name: 'Attendance Update',
          eventType: MessageEventType.ATTENDANCE_UPDATE,
          content:
            'עדכון משתתפים לטיול {tripName}:\nמספר משפחות: {attendeeCount}\n\nרשימת משתתפים:\n{attendeeList}',
        },
        {
          name: 'Gear Assignment',
          eventType: MessageEventType.GEAR_ASSIGNMENT,
          content: 'חלוקת ציוד לטיול {tripName}:\n\n{gearList}',
        },
        {
          name: 'Trip Reminder',
          eventType: MessageEventType.TRIP_REMINDER,
          content:
            'תזכורת! הטיול {tripName} מתקרב!\nמיקום: {location}\nתאריך יציאה: {startDate}\nנותרו {daysUntilTrip} ימים',
        },
        {
          name: 'Trip Start',
          eventType: MessageEventType.TRIP_START,
          content:
            'הטיול {tripName} מתחיל היום!\nמיקום: {location}\n\nתוכנית היום:\n{schedule}',
        },
        {
          name: 'Cutoff Reminder',
          eventType: MessageEventType.ATTENDANCE_CUTOFF_REMINDER,
          content:
            'תזכורת! המועד האחרון להרשמה לטיול {tripName} הוא {cutoffDate}\nנותרו {daysUntilCutoff} ימים',
        },
      ];

      for (const template of templates) {
        await prisma.whatsAppMessageTemplate.upsert({
          where: { name: template.name },
          create: template,
          update: {},
        });
      }
    });

    it('should generate a manual message from template', async () => {
      const response = await request(app)
        .post('/api/whatsapp/generate')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          templateId,
          tripId,
          variables: {
            tripName: 'Summer Camp',
            location: 'Eilat',
            startDate: '1 בדצמבר 2025',
            endDate: '3 בדצמבר 2025',
          },
          triggerType: MessageTriggerType.MANUAL,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body.content).toContain('Summer Camp');
      expect(response.body.content).toContain('Eilat');
    });

    it('should generate trip created message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/created`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Test Trip');
      expect(response.body.content).toContain('Test Location');
    });

    it('should generate trip published message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/published`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Test Trip');
    });

    it('should generate attendance update message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/attendance`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Regular Family');
    });

    it('should generate gear assignment message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/gear`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Tent');
      expect(response.body.content).toContain('Regular Family');
    });

    it('should generate trip reminder message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/reminder`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          daysUntilTrip: 7,
          triggerType: MessageTriggerType.MANUAL,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('7');
    });

    it('should generate trip start message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/start`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Morning Activity');
    });

    it('should generate attendance cutoff reminder message', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/cutoff-reminder`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
    });

    it('should prevent family users from generating messages', async () => {
      const response = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/created`)
        .set('Authorization', `Bearer ${familyToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .post('/api/whatsapp/trip/non-existent-id/created')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(response.status).toBe(404);
    });
  });

  describe('Message History', () => {
    it('should retrieve message history for a trip', async () => {
      // Generate a message first
      await request(app)
        .post(`/api/whatsapp/trip/${tripId}/created`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      const response = await request(app)
        .get(`/api/whatsapp/trip/${tripId}/messages`)
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('eventType');
      expect(response.body[0]).toHaveProperty('template');
    });

    it('should allow super admin to view all messages', async () => {
      const response = await request(app)
        .get('/api/whatsapp/messages')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should prevent trip admin from viewing all messages', async () => {
      const response = await request(app)
        .get('/api/whatsapp/messages')
        .set('Authorization', `Bearer ${tripAdminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Logging', () => {
    it('should log message generation events', async () => {
      // Generate a message
      const messageResponse = await request(app)
        .post(`/api/whatsapp/trip/${tripId}/created`)
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({ triggerType: MessageTriggerType.MANUAL });

      expect(messageResponse.status).toBe(200);

      // Verify that the mocked log service was called
      const { logService } = await import('../src/services/log.service.js');
      expect(logService.log).toHaveBeenCalled();

      // Check the call arguments
      const lastCall = vi.mocked(logService.log).mock.calls[
        vi.mocked(logService.log).mock.calls.length - 1
      ];
      expect(lastCall[1]).toBe(ActionType.MESSAGE_GENERATED);
      expect(lastCall[2]).toBe('WhatsAppMessage');
    });
  });

  describe('Variable Replacement', () => {
    it('should correctly replace all variables in template', async () => {
      const customTemplate = await prisma.whatsAppMessageTemplate.create({
        data: {
          name: 'Custom Test Template',
          eventType: MessageEventType.CUSTOM,
          content: 'Hello {name}, you have {count} messages. Status: {status}',
        },
      });

      const response = await request(app)
        .post('/api/whatsapp/generate')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          templateId: customTemplate.id,
          variables: {
            name: 'John',
            count: '5',
            status: 'Active',
          },
          triggerType: MessageTriggerType.MANUAL,
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(
        'Hello John, you have 5 messages. Status: Active',
      );
      expect(response.body.content).not.toContain('{');
    });

    it('should handle missing variables gracefully', async () => {
      const response = await request(app)
        .post('/api/whatsapp/generate')
        .set('Authorization', `Bearer ${tripAdminToken}`)
        .send({
          templateId,
          variables: {
            tripName: 'Test',
            // Missing other variables
          },
          triggerType: MessageTriggerType.MANUAL,
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toContain('Test');
      // Should still have unreplaced variables
      expect(response.body.content).toContain('{');
    });
  });
});
