/**
 * Logger Utility
 * Centralized logging with environment-based configuration
 */

import { ENV } from '../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (ENV.isProduction) {
      // In production, only log errors
      return level === 'error';
    }
    return ENV.logging.enabled;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
      
      // In production, you might want to send errors to a monitoring service
      if (ENV.isProduction) {
        // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
        this.sendToErrorTracking(message, error);
      }
    }
  }

  private sendToErrorTracking(message: string, error: any): void {
    // Placeholder for error tracking integration
    // e.g., Sentry.captureException(error, { message });
  }
}

export const logger = new Logger();
