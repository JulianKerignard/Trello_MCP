/**
 * Centralized Logger using Pino
 *
 * Provides structured logging with JSON output for production
 * and pretty-printed output for development.
 */

import pino from 'pino';

/**
 * Log levels:
 * - trace (10): Very detailed debugging
 * - debug (20): Debugging information
 * - info (30): General information (default)
 * - warn (40): Warning messages
 * - error (50): Error messages
 * - fatal (60): Fatal errors (crashes)
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false
        }
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

/**
 * Create a child logger with additional context
 *
 * @example
 * const toolLogger = createChildLogger({ tool: 'create_board' });
 * toolLogger.info({ boardId: '123' }, 'Board created');
 */
export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

/**
 * Log an error with stack trace
 *
 * @example
 * logError(new Error('Failed to connect'), 'Database connection failed');
 */
export function logError(error: Error, message?: string) {
  logger.error(
    {
      err: {
        type: error.name,
        message: error.message,
        stack: error.stack
      }
    },
    message || error.message
  );
}

export default logger;
