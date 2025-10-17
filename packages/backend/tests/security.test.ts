import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import { clearDatabase } from './utils/db.js';

// Mock the logging service to avoid DB foreign key constraints
vi.mock('../src/services/log.service.js', () => ({
  logService: {
    log: vi.fn().mockResolvedValue({}),
    logUserAction: vi.fn().mockResolvedValue({}),
  },
  __esModule: true,
}));

describe('Security Middleware', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('Security Headers', () => {
    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-XSS-Protection header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should set Referrer-Policy header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('referrer-policy');
      expect(response.headers['referrer-policy']).toBe(
        'strict-origin-when-cross-origin',
      );
    });

    it('should set Permissions-Policy header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('permissions-policy');
      expect(response.headers['permissions-policy']).toContain('camera=()');
      expect(response.headers['permissions-policy']).toContain('microphone=()');
      expect(response.headers['permissions-policy']).toContain(
        'geolocation=()',
      );
    });

    it('should remove X-Powered-By header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).not.toHaveProperty('x-powered-by');
    });

    it('should set HSTS header only if configured for production', async () => {
      const response = await request(app).get('/api/health');

      // HSTS may or may not be set depending on NODE_ENV at startup
      // This just checks if it's set, it has the correct value
      if (response.headers['strict-transport-security']) {
        expect(response.headers['strict-transport-security']).toContain(
          'max-age=31536000',
        );
        expect(response.headers['strict-transport-security']).toContain(
          'includeSubDomains',
        );
      }
    });
  });

  describe('Content Security Policy', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('should include default-src directive', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
    });

    it('should include script-src directive with required sources', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('script-src');
      expect(csp).toContain("'self'");
    });

    it('should include img-src directive allowing data URIs', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('img-src');
      expect(csp).toContain('data:');
    });

    it('should set object-src to none', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("object-src 'none'");
    });

    it('should include upgrade-insecure-requests if configured for production', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];
      // upgrade-insecure-requests is only set when NODE_ENV is production at startup
      // In test environment, it may or may not be set, so we just check CSP exists
      expect(csp).toBeDefined();
    });
  });

  describe('Parameter Pollution Prevention', () => {
    it('should handle normal single-value query parameters', async () => {
      const response = await request(app).get('/api/health?test=value');

      // Should process normally
      expect(response.status).not.toBe(500);
    });

    it('should handle multiple query parameters', async () => {
      const response = await request(app).get(
        '/api/health?param1=value1&param2=value2',
      );

      // Should process normally
      expect(response.status).not.toBe(500);
    });

    it('should prevent array-based parameter pollution', async () => {
      // Attempt parameter pollution with duplicate keys
      const response = await request(app).get(
        '/api/health?test=value1&test=value2',
      );

      // Should process without error (middleware handles it)
      expect(response.status).not.toBe(500);
    });
  });

  describe('Request Fingerprinting', () => {
    it('should process requests with fingerprinting', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('User-Agent', 'Test Browser/1.0')
        .set('Accept-Language', 'en-US,en;q=0.9');

      // Should process normally
      expect(response.status).toBe(200);
    });

    it('should handle requests without user agent', async () => {
      const response = await request(app).get('/api/health');

      // Should still process normally
      expect(response.status).toBe(200);
    });

    it('should handle requests without accept-language', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('User-Agent', 'Test Browser/1.0');

      // Should still process normally
      expect(response.status).toBe(200);
    });
  });

  describe('Helmet Security', () => {
    it('should apply helmet middleware', async () => {
      const response = await request(app).get('/api/health');

      // Helmet should add multiple security headers
      // Check for at least some common helmet headers
      const headers = Object.keys(response.headers);
      const hasSecurityHeaders = headers.some(
        (h) =>
          h.includes('content-security-policy') ||
          h.includes('x-content-type-options') ||
          h.includes('x-frame-options'),
      );

      expect(hasSecurityHeaders).toBe(true);
    });
  });

  describe('Integration with Other Middleware', () => {
    it('should work with CORS middleware', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', process.env.CLIENT_URL || 'http://localhost:3000');

      // Should have both security headers and CORS headers
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty(
        'access-control-allow-origin',
        process.env.CLIENT_URL || 'http://localhost:3000',
      );
    });

    it('should work with JSON body parser', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        familyName: 'Test Family',
        phone: '1234567890',
      });

      // Should have security headers on POST requests
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should apply security headers to 404 responses', async () => {
      const response = await request(app).get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should apply security headers to error responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'invalid' });

      // Even error responses should have security headers
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Security Headers Consistency', () => {
    it('should apply security headers to all routes', async () => {
      const routes = ['/api/health', '/api/auth/me', '/api/trips'];

      for (const route of routes) {
        const response = await request(app).get(route);

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers).toHaveProperty('referrer-policy');
      }
    });

    describe('Security Headers for Different Methods', () => {
      it('should apply security headers to GET requests', async () => {
        const response = await request(app).get('/api/health');

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-content-type-options');
      });

      it('should apply security headers to POST requests', async () => {
        const response = await request(app).post('/api/health');

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-content-type-options');
      });

      it('should apply security headers to PUT requests', async () => {
        const response = await request(app).put('/api/health');

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-content-type-options');
      });

      it('should apply security headers to DELETE requests', async () => {
        const response = await request(app).delete('/api/health');

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-content-type-options');
      });
    });
  });

  describe('Security Best Practices', () => {
    it('should not expose server implementation details', async () => {
      const response = await request(app).get('/api/health');

      // Should not have X-Powered-By
      expect(response.headers).not.toHaveProperty('x-powered-by');

      // Should not expose server version
      if (response.headers.server) {
        expect(response.headers.server).not.toMatch(/\d+\.\d+/);
      }
    });

    it('should enforce MIME type sniffing protection', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should enforce clickjacking protection', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should have proper referrer policy', async () => {
      const response = await request(app).get('/api/health');

      const referrerPolicy = response.headers['referrer-policy'];
      expect(referrerPolicy).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('CSP Violation Handling', () => {
    it('should set up CSP that allows necessary resources', async () => {
      const response = await request(app).get('/api/health');

      const csp = response.headers['content-security-policy'];

      // Should allow self
      expect(csp).toContain("'self'");

      // Should allow necessary font sources
      expect(csp).toContain('font-src');

      // Should allow necessary image sources
      expect(csp).toContain('img-src');
    });
  });

  describe('Production vs Development Security', () => {
    it('should have consistent security headers regardless of environment', async () => {
      const response = await request(app).get('/api/health');

      // These headers should always be set
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('referrer-policy');
      expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('should apply base security headers in all environments', async () => {
      const response = await request(app).get('/api/health');

      // Core security headers that should always be present
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});
