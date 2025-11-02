/**
 * Health Check Endpoint
 * Provides application health status for monitoring
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db.js';
import {
  performanceMonitor,
  PerformanceStats,
} from '../utils/performanceMonitor.js';
import { responseCache } from '../middleware/cache.js';

const router = Router();

interface CheckStatus {
  status: 'ok' | 'error';
  message?: string;
}

interface CacheCheckStatus extends CheckStatus {
  hits?: number;
  misses?: number;
  size?: number;
}

interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string | undefined;
  memory: NodeJS.MemoryUsage;
  checks: {
    database: CheckStatus;
    cache: CacheCheckStatus;
  };
  performance: PerformanceStats | null;
}

interface ReadinessResponse {
  ready: boolean;
  error?: string;
}

interface LivenessResponse {
  alive: boolean;
}

/**
 * Detailed health check with dependencies
 */
router.get(
  '/health',
  async (req: Request, res: Response<HealthCheckResponse>): Promise<void> => {
    const checks: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      checks: {
        database: { status: 'ok' },
        cache: { status: 'ok' },
      },
      performance: null,
    };

    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.checks.database = { status: 'ok' };
    } catch (error) {
      checks.checks.database = {
        status: 'error',
        message: (error as Error).message,
      };
      checks.status = 'degraded';
    }

    // Cache check
    try {
      const cacheStats = responseCache.stats();
      checks.checks.cache = { status: 'ok', ...cacheStats };
    } catch (error) {
      checks.checks.cache = {
        status: 'error',
        message: (error as Error).message,
      };
    }

    // Performance metrics
    try {
      const perfStats = performanceMonitor.getStats();
      checks.performance = perfStats;
    } catch {
      // Non-critical
    }

    res.json(checks);
  },
);

/**
 * Readiness check (for Kubernetes/container orchestration)
 */
router.get(
  '/ready',
  async (req: Request, res: Response<ReadinessResponse>): Promise<void> => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ready: true });
    } catch {
      res.status(503).json({
        ready: false,
        error: 'Database not ready',
      });
    }
  },
);

/**
 * Liveness check (for Kubernetes/container orchestration)
 */
router.get('/live', (req: Request, res: Response<LivenessResponse>): void => {
  res.json({ alive: true });
});

/**
 * Metrics endpoint (Prometheus-compatible)
 */
router.get('/metrics', (req: Request, res: Response<string>): void => {
  const metrics = performanceMonitor.getMetrics();
  const stats = performanceMonitor.getStats();

  // Simple text format for Prometheus
  const lines: string[] = [
    '# HELP app_requests_total Total number of requests',
    '# TYPE app_requests_total counter',
    `app_requests_total ${metrics.length}`,
    '',
    '# HELP app_request_duration_ms Request duration in milliseconds',
    '# TYPE app_request_duration_ms summary',
  ];

  if (stats) {
    lines.push(`app_request_duration_ms_sum ${stats.total}`);
    lines.push(`app_request_duration_ms_count ${stats.count}`);
    lines.push(`app_request_duration_ms_avg ${stats.avg}`);
  }

  lines.push('');
  lines.push('# HELP app_memory_usage_bytes Memory usage in bytes');
  lines.push('# TYPE app_memory_usage_bytes gauge');
  lines.push(
    `app_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
  );
  lines.push(
    `app_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
  );
  lines.push(
    `app_memory_usage_bytes{type="external"} ${process.memoryUsage().external}`,
  );

  res.type('text/plain').send(lines.join('\n'));
});

export default router;
