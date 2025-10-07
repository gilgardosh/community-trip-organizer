import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Request, Response } from 'express';

// Mock OAuth middleware
vi.mock('../src/middleware/oauth.middleware.js', () => ({
  default: {
    authenticate:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_strategy: string) => (req: Request, res: Response, next: () => void) =>
        next(),
  },
  __esModule: true,
}));

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
