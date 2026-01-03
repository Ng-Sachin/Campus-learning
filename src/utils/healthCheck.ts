/**
 * Application Health Check
 * Monitors application health and connectivity
 */

import { ENV, validateEnvironment } from '../config/environment';
import { logger } from './logger';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    environment: boolean;
    firebase: boolean;
    network: boolean;
  };
  errors: string[];
  timestamp: number;
}

/**
 * Run comprehensive health check
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const errors: string[] = [];
  const checks = {
    environment: false,
    firebase: false,
    network: false,
  };

  // Check environment configuration
  try {
    const envValidation = validateEnvironment();
    checks.environment = envValidation.valid;
    if (!envValidation.valid) {
      errors.push(...envValidation.errors);
    }
  } catch (error) {
    errors.push('Environment validation failed');
    logger.error('Environment check failed', error);
  }

  // Check Firebase connectivity
  try {
    const { auth } = await import('../services/firebase');
    checks.firebase = auth !== null;
  } catch (error) {
    errors.push('Firebase initialization failed');
    logger.error('Firebase check failed', error);
  }

  // Check network connectivity
  try {
    checks.network = navigator.onLine;
    if (!checks.network) {
      errors.push('No network connection');
    }
  } catch (error) {
    errors.push('Network check failed');
    logger.error('Network check failed', error);
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  const healthyChecks = Object.values(checks).filter(Boolean).length;
  
  if (healthyChecks === 3) {
    status = 'healthy';
  } else if (healthyChecks >= 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    checks,
    errors,
    timestamp: Date.now(),
  };
}

/**
 * Monitor application health periodically
 */
export class HealthMonitor {
  private interval: NodeJS.Timeout | null = null;
  private listeners: ((result: HealthCheckResult) => void)[] = [];

  start(intervalMs: number = 60000): void {
    if (this.interval) {
      logger.warn('Health monitor already running');
      return;
    }

    logger.info('Starting health monitor', { intervalMs });

    this.interval = setInterval(async () => {
      const result = await runHealthCheck();
      
      if (result.status !== 'healthy') {
        logger.warn('Health check failed', result);
      }

      this.notifyListeners(result);
    }, intervalMs);

    // Run initial check
    runHealthCheck().then((result) => this.notifyListeners(result));
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Health monitor stopped');
    }
  }

  subscribe(listener: (result: HealthCheckResult) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(result: HealthCheckResult): void {
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (error) {
        logger.error('Health monitor listener error', error);
      }
    });
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();
