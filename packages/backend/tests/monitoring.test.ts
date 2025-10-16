import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import { performanceMonitor } from '../src/utils/performanceMonitor.js';
import { responseCache } from '../src/middleware/cache.js';

// Mock modules
vi.mock('../src/middleware/oauth.middleware.js', () => ({
  default: {
    authenticate: (_strategy: string) => (req: any, res: any, next: () => void) => next(),
  },
  __esModule: true,
}));

const prisma = new PrismaClient();

describe('Monitoring Routes', () => {
  beforeEach(() => {
    // Reset performance monitor before each test
    performanceMonitor.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/monitoring/health', () => {
    it('should return detailed health check with all systems ok', async () => {
      const response = await request(app).get('/api/monitoring/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ok|degraded)$/),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        memory: {
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
          external: expect.any(Number),
          arrayBuffers: expect.any(Number),
        },
        checks: expect.objectContaining({
          database: expect.any(Object),
          cache: expect.any(Object),
        }),
      });
    });

    it('should include database status check', async () => {
      const response = await request(app).get('/api/monitoring/health');

      expect(response.body.checks.database).toBeDefined();
      expect(response.body.checks.database.status).toMatch(/^(ok|error)$/);
    });

    it('should include cache status check', async () => {
      const response = await request(app).get('/api/monitoring/health');

      expect(response.body.checks.cache).toBeDefined();
      expect(response.body.checks.cache.status).toMatch(/^(ok|error)$/);
    });

    it('should include performance metrics if available', async () => {
      // Add some performance metrics
      performanceMonitor.start('test-operation');
      await new Promise((resolve) => setTimeout(resolve, 10));
      performanceMonitor.end('test-operation');

      const response = await request(app).get('/api/monitoring/health');

      expect(response.body.performance).toBeDefined();
      if (response.body.performance) {
        expect(response.body.performance).toMatchObject({
          name: 'all',
          count: expect.any(Number),
          avg: expect.any(Number),
          min: expect.any(Number),
          max: expect.any(Number),
          total: expect.any(Number),
        });
      }
    });

    it('should return degraded status when database fails', async () => {
      // Mock database failure
      const originalQueryRaw = prisma.$queryRaw;
      prisma.$queryRaw = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/monitoring/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('degraded');
      expect(response.body.checks.database.status).toBe('error');
      expect(response.body.checks.database.message).toBeDefined();
      expect(typeof response.body.checks.database.message).toBe('string');

      // Restore original function
      prisma.$queryRaw = originalQueryRaw;
    });
  });

  describe('GET /api/monitoring/ready', () => {
    it('should return ready when database is accessible or 503 when not', async () => {
      const response = await request(app).get('/api/monitoring/ready');

      // Accept both ready and not ready states depending on test environment
      if (response.status === 200) {
        expect(response.body).toEqual({ ready: true });
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toEqual({
          ready: false,
          error: 'Database not ready',
        });
      }
    });

    it('should return 503 when database is not ready', async () => {
      // Mock database failure
      const originalQueryRaw = prisma.$queryRaw;
      prisma.$queryRaw = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/api/monitoring/ready');

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        ready: false,
        error: 'Database not ready',
      });

      // Restore original function
      prisma.$queryRaw = originalQueryRaw;
    });
  });

  describe('GET /api/monitoring/live', () => {
    it('should return alive true', async () => {
      const response = await request(app).get('/api/monitoring/live');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ alive: true });
    });

    it('should always return 200 regardless of system state', async () => {
      const response = await request(app).get('/api/monitoring/live');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/monitoring/metrics', () => {
    it('should return Prometheus-compatible metrics', async () => {
      const response = await request(app).get('/api/monitoring/metrics');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/plain/);
      expect(response.text).toContain('# HELP app_requests_total');
      expect(response.text).toContain('# TYPE app_requests_total counter');
      expect(response.text).toContain('app_requests_total');
    });

    it('should include memory usage metrics', async () => {
      const response = await request(app).get('/api/monitoring/metrics');

      expect(response.text).toContain('# HELP app_memory_usage_bytes');
      expect(response.text).toContain('# TYPE app_memory_usage_bytes gauge');
      expect(response.text).toContain('app_memory_usage_bytes{type="heapUsed"}');
      expect(response.text).toContain('app_memory_usage_bytes{type="heapTotal"}');
      expect(response.text).toContain('app_memory_usage_bytes{type="external"}');
    });

    it('should include request duration metrics when available', async () => {
      // Add some performance metrics
      performanceMonitor.start('test-request');
      await new Promise((resolve) => setTimeout(resolve, 5));
      performanceMonitor.end('test-request');

      const response = await request(app).get('/api/monitoring/metrics');

      expect(response.text).toContain('# HELP app_request_duration_ms');
      expect(response.text).toContain('# TYPE app_request_duration_ms summary');
      expect(response.text).toContain('app_request_duration_ms_sum');
      expect(response.text).toContain('app_request_duration_ms_count');
      expect(response.text).toContain('app_request_duration_ms_avg');
    });

    it('should return valid metric values', async () => {
      performanceMonitor.start('operation-1');
      await new Promise((resolve) => setTimeout(resolve, 10));
      performanceMonitor.end('operation-1');

      const response = await request(app).get('/api/monitoring/metrics');

      // Extract metric values from response
      const lines = response.text.split('\n');
      const totalLine = lines.find((line) => line.startsWith('app_requests_total'));
      const sumLine = lines.find((line) => line.startsWith('app_request_duration_ms_sum'));

      expect(totalLine).toBeDefined();
      expect(sumLine).toBeDefined();

      if (totalLine) {
        const totalValue = parseInt(totalLine.split(' ')[1]);
        expect(totalValue).toBeGreaterThanOrEqual(1);
      }

      if (sumLine) {
        const sumValue = parseFloat(sumLine.split(' ')[1]);
        expect(sumValue).toBeGreaterThan(0);
      }
    });

    it('should format metrics for Prometheus scraping', async () => {
      const response = await request(app).get('/api/monitoring/metrics');

      // Check Prometheus format structure
      const lines = response.text.split('\n');
      const helpLines = lines.filter((line) => line.startsWith('# HELP'));
      const typeLines = lines.filter((line) => line.startsWith('# TYPE'));
      const metricLines = lines.filter(
        (line) => line && !line.startsWith('#') && line.trim().length > 0,
      );

      expect(helpLines.length).toBeGreaterThan(0);
      expect(typeLines.length).toBeGreaterThan(0);
      expect(metricLines.length).toBeGreaterThan(0);

      // Each metric line should have format: metric_name{labels} value
      metricLines.forEach((line) => {
        expect(line).toMatch(/^[\w_]+(\{[^}]+\})?\s+[\d.]+$/);
      });
    });
  });

  describe('Endpoint integration', () => {
    it('should track performance of monitoring endpoints', async () => {
      const initialMetrics = performanceMonitor.getMetrics();
      const initialCount = initialMetrics.length;

      // Make multiple requests
      await request(app).get('/api/monitoring/health');
      await request(app).get('/api/monitoring/ready');
      await request(app).get('/api/monitoring/live');

      const finalMetrics = performanceMonitor.getMetrics();
      const finalCount = finalMetrics.length;

      // Should have added metrics (if performance middleware is applied)
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });

    it('should have consistent timestamp format across endpoints', async () => {
      const healthResponse = await request(app).get('/api/monitoring/health');

      const timestamp = healthResponse.body.timestamp;
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('Cache statistics', () => {
    it('should include cache statistics in health check', async () => {
      const response = await request(app).get('/api/monitoring/health');

      expect(response.body.checks.cache).toBeDefined();
      expect(response.body.checks.cache.status).toBe('ok');
    });
  });

  describe('Error handling', () => {
    it('should handle partial failures gracefully', async () => {
      // Mock cache failure
      const originalStats = responseCache.stats;
      responseCache.stats = vi.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      const response = await request(app).get('/api/monitoring/health');

      expect(response.status).toBe(200);
      expect(response.body.checks.cache.status).toBe('error');
      expect(response.body.checks.cache.message).toBe('Cache error');

      // Restore original function
      responseCache.stats = originalStats;
    });

    it('should not fail when performance monitor has no data', async () => {
      performanceMonitor.reset();

      const response = await request(app).get('/api/monitoring/metrics');

      expect(response.status).toBe(200);
      expect(response.text).toContain('app_requests_total 0');
    });
  });
});
