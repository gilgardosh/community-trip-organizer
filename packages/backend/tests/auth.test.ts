import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { User, Role } from '@prisma/client';

describe('Auth API', () => {
  let user: User;
  let token: string;

  beforeAll(async () => {
    await prisma.log.deleteMany();
    await prisma.user.deleteMany();
    await prisma.family.deleteMany();
  });

  afterAll(async () => {
    await prisma.log.deleteMany();
    await prisma.user.deleteMany();
    await prisma.family.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        familyName: 'Test Family',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      token = (res.body as { token: string }).token;

      user = (await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      })) as User;
      expect(user).not.toBeNull();
      expect(user.name).toBe('Test User');
      expect(user.role).toBe(Role.FAMILY);
    });

    it('should not register a user with an existing email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login the user and return a token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Protected Route', () => {
    it('should allow access to a protected route with a valid token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('should not allow access to a protected route without a token', async () => {
      const res = await request(app).get('/api/protected');
      expect(res.status).toBe(401);
    });
  });
});
