// src/utils/logger.ts
/**
 * @fileoverview Production-safe logger utility.
 * Wraps console methods so that console.log is blocked in production,
 * while warn/error are always allowed. Satisfies ESLint no-console rule.
 */

const isDev = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test';

export const logger = {
  /**
   * Logs an info message only in development/test mode.
   * @param args - Values to log
   */
  log: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  /**
   * Logs an info message. Alias for log().
   * @param args - Values to log
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  /**
   * Logs a warning in all environments.
   * @param args - Values to log
   */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  /**
   * Logs an error in all environments.
   * @param args - Values to log
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
