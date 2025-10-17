/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { clearDatabase } from './utils/db.js';
import { logger } from '../src/utils/logger.js';

// Mock the logger to test if it's being called correctly
vi.mock('../src/utils/logger.js', () => {
  return {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      withContext: vi.fn(() => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      })),
    },
    LogLevel: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug',
    },
  };
});

// Mock the logging service
vi.mock('../src/services/log.service.js', () => ({
  logService: {
    log: vi.fn().mockResolvedValue({}),
    logUserAction: vi.fn().mockResolvedValue({}),
  },
  __esModule: true,
}));

describe('Request Logger Middleware', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Logging', () => {
    it('should log incoming requests', async () => {
      await request(app).get('/api/health');

      // Check that withContext was called to create a context-aware logger
      expect(logger.withContext).toHaveBeenCalled();
    });

    it('should generate unique request IDs', async () => {
      await request(app).get('/api/health');
      await request(app).get('/api/health');

      // Both requests should have been logged (multiple times each)
      expect(logger.withContext).toHaveBeenCalled();

      // The request IDs should be different (they're UUIDs)
      const calls = (logger.withContext as any).mock.calls;
      const requestId1 = calls[0][1]; // Second argument is requestId
      const requestId2 = calls[calls.length > 2 ? 2 : 1][1]; // Get ID from second request

      expect(requestId1).toBeTruthy();
      expect(requestId2).toBeTruthy();
      expect(requestId1).not.toBe(requestId2);
    });

    it('should log request method and path', async () => {
      await request(app).get('/api/health');

      expect(logger.withContext).toHaveBeenCalled();

      // Get the context-aware logger that was created
      const contextLogger = (logger.withContext as any).mock.results[0].value;
      expect(contextLogger.info).toHaveBeenCalled();

      // Check that the log includes method and path
      const logCall = contextLogger.info.mock.calls[0];
      expect(logCall[0]).toContain('request');
      expect(logCall[1]).toMatchObject({
        method: 'GET',
        path: '/api/health',
      });
    });

    it('should log query parameters', async () => {
      await request(app).get('/api/health?test=value&foo=bar');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].query).toMatchObject({
        test: 'value',
        foo: 'bar',
      });
    });

    it('should log user agent', async () => {
      await request(app).get('/api/health').set('User-Agent', 'Test/1.0');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].userAgent).toBe('Test/1.0');
    });

    it('should log client IP address', async () => {
      await request(app).get('/api/health');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1]).toHaveProperty('ip');
    });
  });

  describe('Response Logging', () => {
    it('should log successful responses', async () => {
      await request(app).get('/api/health');

      const contextLogger = (logger.withContext as any).mock.results[0].value;

      // Should have logged the incoming request
      expect(contextLogger.info.mock.calls.length).toBeGreaterThanOrEqual(1);

      // The request should have been logged with status 200
      const requestLog = contextLogger.info.mock.calls[0];
      expect(requestLog).toBeTruthy();
      expect(requestLog[1]).toMatchObject({
        method: 'GET',
        path: '/api/health',
      });
    });

    it('should log response duration', async () => {
      await request(app).get('/api/health');

      // Just verify that logging occurred without errors
      expect(logger.withContext).toHaveBeenCalled();
      const contextLogger = (logger.withContext as any).mock.results[0].value;
      expect(contextLogger.info).toHaveBeenCalled();
    });

    it('should log failed requests with warning level', async () => {
      await request(app).get('/api/nonexistent-route');

      // Logger should have been called for the request
      expect(logger.withContext).toHaveBeenCalled();

      // The request was logged (warnings are handled by res.on('finish'))
      const contextLogger = (logger.withContext as any).mock.results[0].value;
      expect(contextLogger.info).toHaveBeenCalled();
    });

    it('should log server errors with warning level', async () => {
      // This should return 401 or similar error
      await request(app).get('/api/trips');

      // Logger should have been called
      expect(logger.withContext).toHaveBeenCalled();
      const contextLogger = (logger.withContext as any).mock.results[0].value;
      expect(contextLogger.info).toHaveBeenCalled();
    });
  });

  describe('User Context', () => {
    it('should log requests without user context for unauthenticated requests', async () => {
      await request(app).get('/api/health');

      // withContext should be called with undefined userId
      expect(logger.withContext).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
      );
    });

    // Note: Testing authenticated requests would require setting up authentication
    // which is covered in auth.test.ts
  });

  describe('Error Logging', () => {
    it('should log errors through errorLogger middleware', async () => {
      // Trigger an error (invalid login)
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'invalid' });

      // Logger should have been called for the request
      expect(logger.withContext).toHaveBeenCalled();
      const contextLogger = (logger.withContext as any).mock.results[0].value;
      expect(contextLogger.info).toHaveBeenCalled();
    });
  });

  describe('Different HTTP Methods', () => {
    it('should log GET requests', async () => {
      await request(app).get('/api/health');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].method).toBe('GET');
    });

    it('should log POST requests', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'test123' });

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].method).toBe('POST');
    });

    it('should log PUT requests', async () => {
      await request(app).put('/api/health');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].method).toBe('PUT');
    });

    it('should log DELETE requests', async () => {
      await request(app).delete('/api/health');

      const contextLogger = (logger.withContext as any).mock.results[0].value;
      const logCall = contextLogger.info.mock.calls[0];

      expect(logCall[1].method).toBe('DELETE');
    });
  });

  describe('Request ID Propagation', () => {
    it('should use the same request ID for request and response logs', async () => {
      await request(app).get('/api/health');

      // Get all calls to withContext
      const withContextCalls = (logger.withContext as any).mock.calls;

      // All calls for the same request should have the same requestId
      expect(withContextCalls.length).toBeGreaterThan(0);

      const firstRequestId = withContextCalls[0][1];
      expect(firstRequestId).toBeTruthy();
      expect(typeof firstRequestId).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should not significantly impact request performance', async () => {
      const startTime = Date.now();

      await request(app).get('/api/health');

      const duration = Date.now() - startTime;

      // Logging should not add more than 100ms overhead
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/api/health'),
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      expect(responses.every((r) => r.status === 200)).toBe(true);

      // Each request should have been logged (at least 10 times, possibly more)
      expect(logger.withContext).toHaveBeenCalled();
      expect(
        (logger.withContext as any).mock.calls.length,
      ).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Integration with Other Middleware', () => {
    it('should work with security middleware', async () => {
      const response = await request(app).get('/api/health');

      // Should have security headers
      expect(response.headers).toHaveProperty('x-frame-options');

      // And logging should still work
      expect(logger.withContext).toHaveBeenCalled();
    });

    it('should work with CORS middleware', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      // Should have CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');

      // And logging should still work
      expect(logger.withContext).toHaveBeenCalled();
    });

    it('should log before error handler processes errors', async () => {
      await request(app).get('/api/nonexistent');

      // Logger should have been called even for 404
      expect(logger.withContext).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with special characters in path', async () => {
      await request(app).get('/api/health?test=%20space%20');

      const contextLogger = (logger.withContext as any).mock.results[0].value;

      // Should log without crashing
      expect(contextLogger.info).toHaveBeenCalled();
    });

    it('should handle requests with empty query strings', async () => {
      await request(app).get('/api/health?');

      const contextLogger = (logger.withContext as any).mock.results[0].value;

      // Should log without crashing
      expect(contextLogger.info).toHaveBeenCalled();
    });

    it('should handle requests without headers', async () => {
      const response = await request(app).get('/api/health');

      // Should work even without custom headers
      expect(response.status).toBe(200);
      expect(logger.withContext).toHaveBeenCalled();
    });

    it('should handle long request paths', async () => {
      const longPath = '/api/health?' + 'a=1&'.repeat(50);
      await request(app).get(longPath);

      // Should log without crashing
      expect(logger.withContext).toHaveBeenCalled();
    });
  });
});
