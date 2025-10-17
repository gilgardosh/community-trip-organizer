/**
 * Performance Monitoring
 * Tracks and reports performance metrics
 */

import { logger } from '../utils/logger.js';

type MetricMetadata = Record<string, string | number | boolean>;

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: MetricMetadata;
}

export interface PerformanceStats {
  name: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  total: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(name: string): void {
    this.timers.set(name, Date.now());
  }

  /**
   * End timing and record metric
   */
  end(name: string, metadata?: MetricMetadata): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Performance timer '${name}' was never started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${name}`, {
        duration: `${duration}ms`,
        ...metadata,
      });
    }

    return duration;
  }

  /**
   * Measure async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: MetricMetadata,
  ): Promise<T> {
    this.start(name);
    try {
      const result = await operation();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, metadata ? { ...metadata, error: true } : { error: true });
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(metricName?: string): PerformanceStats | null {
    const filtered = metricName
      ? this.metrics.filter((m) => m.name === metricName)
      : this.metrics;

    if (filtered.length === 0) {
      return null;
    }

    const durations = filtered.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      name: metricName || 'all',
      count: filtered.length,
      avg: sum / filtered.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      total: sum,
    };
  }

  /**
   * Clear old metrics (keep last hour)
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(
      (m) => new Date(m.timestamp).getTime() > oneHourAgo,
    );
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.timers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup old metrics every 10 minutes
setInterval(() => {
  performanceMonitor.cleanup();
}, 600000);

/**
 * Performance monitoring decorator
 */
export function Monitor(name?: string) {
  return function <
    T extends (...args: Parameters<T>) => Promise<ReturnType<T>>,
  >(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
      return descriptor;
    }

    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> {
      return performanceMonitor.measure(
        metricName,
        () =>
          originalMethod.apply(this, args) as Promise<Awaited<ReturnType<T>>>,
        { method: propertyKey },
      );
    } as T;

    return descriptor;
  };
}
