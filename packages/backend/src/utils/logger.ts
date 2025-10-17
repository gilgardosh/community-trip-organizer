/**
 * Production Logger
 * Structured logging for production environments
 */

import { createWriteStream } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  requestId?: string;
}

class Logger {
  private level: LogLevel;
  private logStream?: ReturnType<typeof createWriteStream>;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;

    // In production, also write to file
    if (process.env.NODE_ENV === 'production') {
      const logDir = process.env.LOG_DIR || './logs';
      const logFile = join(
        logDir,
        `app-${new Date().toISOString().split('T')[0]}.log`,
      );
      this.logStream = createWriteStream(logFile, { flags: 'a' });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error, userId, requestId } =
      entry;

    const logObject = {
      timestamp,
      level,
      message,
      ...(userId && { userId }),
      ...(requestId && { requestId }),
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    return JSON.stringify(logObject);
  }

  private write(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formatted = this.formatEntry(entry);

    // Console output
    const colorCode = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[90m', // Gray
    }[entry.level];

    console.log(`${colorCode}${formatted}\x1b[0m`);

    // File output in production
    if (this.logStream) {
      this.logStream.write(formatted + '\n');
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      error,
      context,
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    });
  }

  // Context-aware logging methods
  withContext(userId?: string, requestId?: string) {
    return {
      error: (message: string, error?: Error, context?: Record<string, unknown>) =>
        this.write({
          timestamp: new Date().toISOString(),
          level: LogLevel.ERROR,
          message,
          error,
          context,
          userId,
          requestId,
        }),
      warn: (message: string, context?: Record<string, unknown>) =>
        this.write({
          timestamp: new Date().toISOString(),
          level: LogLevel.WARN,
          message,
          context,
          userId,
          requestId,
        }),
      info: (message: string, context?: Record<string, unknown>) =>
        this.write({
          timestamp: new Date().toISOString(),
          level: LogLevel.INFO,
          message,
          context,
          userId,
          requestId,
        }),
      debug: (message: string, context?: Record<string, unknown>) =>
        this.write({
          timestamp: new Date().toISOString(),
          level: LogLevel.DEBUG,
          message,
          context,
          userId,
          requestId,
        }),
    };
  }

  close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// Singleton instance
const logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
export const logger = new Logger(logLevel);

// Graceful shutdown
process.on('beforeExit', () => {
  logger.close();
});
