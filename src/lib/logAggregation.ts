/**
 * Log Aggregation System
 * 
 * Forwards logs to external aggregation services (Logtail, Datadog, etc.)
 * Provides unified logging interface for centralized log management
 * 
 * Usage:
 *   import { logAggregator } from '@/lib/logAggregation';
 *   
 *   logAggregator.info('User registered', { userId: '123' });
 *   logAggregator.error('Registration failed', error, { context });
 */

import { logger, LogLevel, LogContext } from './logger';

export type AggregationProvider = 'logtail' | 'datadog' | 'logdna' | 'custom' | 'none';

interface LogAggregationConfig {
  enabled: boolean;
  provider: AggregationProvider;
  endpoint?: string;
  apiKey?: string;
  source?: string;
  environment?: string;
  batchSize?: number;
  flushInterval?: number;
  enableBatching?: boolean;
}

interface AggregatedLogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    userAgent?: string;
    url?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

class LogAggregator {
  private config: LogAggregationConfig;
  private logBuffer: AggregatedLogEntry[] = [];
  private flushTimer: number | null = null;
  private isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

  constructor() {
    const provider = (import.meta.env.VITE_LOG_AGGREGATION_PROVIDER || 'none') as AggregationProvider;
    
    this.config = {
      enabled: import.meta.env.VITE_LOG_AGGREGATION_ENABLED === 'true',
      provider,
      endpoint: import.meta.env.VITE_LOG_AGGREGATION_ENDPOINT,
      apiKey: import.meta.env.VITE_LOG_AGGREGATION_API_KEY,
      source: import.meta.env.VITE_LOG_AGGREGATION_SOURCE || 'jengahacks-hub',
      environment: import.meta.env.MODE || 'development',
      batchSize: parseInt(import.meta.env.VITE_LOG_AGGREGATION_BATCH_SIZE || '10', 10),
      flushInterval: parseInt(import.meta.env.VITE_LOG_AGGREGATION_FLUSH_INTERVAL || '5000', 10),
      enableBatching: import.meta.env.VITE_LOG_AGGREGATION_BATCHING !== 'false',
    };

    // Auto-flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }

    if (this.isDevelopment && this.config.enabled) {
      console.log(
        '%c[Log Aggregator]%c Initialized',
        'color: #10b981; font-weight: bold;',
        'color: inherit;'
      );
      console.log(
        '%c  Provider: %c' + this.config.provider,
        'color: #6b7280;',
        'color: inherit; font-weight: bold;'
      );
    }
  }

  /**
   * Log an entry to the aggregation service
   */
  log(level: LogLevel, message: string, error?: Error, context?: LogContext): void {
    if (!this.config.enabled || this.config.provider === 'none') {
      return;
    }

    const entry: AggregatedLogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userId: this.extractUserId(context),
        sessionId: this.getSessionId(),
        requestId: this.getRequestId(),
      },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.config.enableBatching) {
      this.bufferLog(entry);
    } else {
      this.sendLog(entry);
    }
  }

  /**
   * Buffer log entry for batch sending
   */
  private bufferLog(entry: AggregatedLogEntry): void {
    this.logBuffer.push(entry);

    // Flush if buffer is full
    if (this.logBuffer.length >= (this.config.batchSize || 10)) {
      this.flush();
    } else {
      // Set timer for auto-flush
      if (!this.flushTimer) {
        this.flushTimer = window.setTimeout(() => {
          this.flush();
        }, this.config.flushInterval || 5000);
      }
    }
  }

  /**
   * Flush buffered logs
   */
  flush(): void {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    this.sendBatch(logsToSend);
  }

  /**
   * Send a single log entry
   */
  private async sendLog(entry: AggregatedLogEntry): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'logtail':
          await this.sendToLogtail(entry);
          break;
        case 'datadog':
          await this.sendToDatadog(entry);
          break;
        case 'logdna':
          await this.sendToLogDNA(entry);
          break;
        case 'custom':
          await this.sendToCustom(entry);
          break;
        default:
          // No-op
          break;
      }
    } catch (error) {
      // Don't log aggregation errors to avoid infinite loops
      if (this.isDevelopment) {
        console.error('[Log Aggregator] Failed to send log:', error);
      }
    }
  }

  /**
   * Send a batch of log entries
   */
  private async sendBatch(entries: AggregatedLogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    try {
      switch (this.config.provider) {
        case 'logtail':
          await this.sendBatchToLogtail(entries);
          break;
        case 'datadog':
          await this.sendBatchToDatadog(entries);
          break;
        case 'logdna':
          await this.sendBatchToLogDNA(entries);
          break;
        case 'custom':
          await this.sendBatchToCustom(entries);
          break;
        default:
          // No-op
          break;
      }
    } catch (error) {
      // Don't log aggregation errors to avoid infinite loops
      if (this.isDevelopment) {
        console.error('[Log Aggregator] Failed to send batch:', error);
      }
    }
  }

  /**
   * Send to Logtail (Better Stack)
   */
  private async sendToLogtail(entry: AggregatedLogEntry): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        dt: entry.timestamp,
        level: entry.level,
        message: entry.message,
        ...entry.error && { error: entry.error },
        ...entry.context && { context: entry.context },
        ...entry.metadata && { metadata: entry.metadata },
        source: this.config.source,
        environment: this.config.environment,
      }),
    });
  }

  private async sendBatchToLogtail(entries: AggregatedLogEntry[]): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        entries: entries.map(entry => ({
          dt: entry.timestamp,
          level: entry.level,
          message: entry.message,
          ...entry.error && { error: entry.error },
          ...entry.context && { context: entry.context },
          ...entry.metadata && { metadata: entry.metadata },
          source: this.config.source,
          environment: this.config.environment,
        })),
      }),
    });
  }

  /**
   * Send to Datadog
   */
  private async sendToDatadog(entry: AggregatedLogEntry): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.config.apiKey || '',
      },
      body: JSON.stringify({
        ddsource: this.config.source,
                ddtags: `env:${this.config.environment}`,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        level: entry.level,
        message: entry.message,
        ...entry.error && { error: entry.error },
        ...entry.context && { context: entry.context },
        ...entry.metadata && { metadata: entry.metadata },
        timestamp: entry.timestamp,
      }),
    });
  }

  private async sendBatchToDatadog(entries: AggregatedLogEntry[]): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.config.apiKey || '',
      },
      body: JSON.stringify({
        entries: entries.map(entry => ({
          ddsource: this.config.source,
          ddtags: `env:${this.config.environment}`,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
          level: entry.level,
          message: entry.message,
          ...entry.error && { error: entry.error },
          ...entry.context && { context: entry.context },
          ...entry.metadata && { metadata: entry.metadata },
          timestamp: entry.timestamp,
        })),
      }),
    });
  }

  /**
   * Send to LogDNA
   */
  private async sendToLogDNA(entry: AggregatedLogEntry): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    const url = new URL(this.config.endpoint);
    url.searchParams.set('hostname', typeof window !== 'undefined' ? window.location.hostname : 'unknown');
    url.searchParams.set('tags', `env:${this.config.environment},source:${this.config.source}`);

    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.config.apiKey || '',
      },
      body: JSON.stringify({
        level: entry.level,
        line: entry.message,
        app: this.config.source,
        ...entry.error && { error: entry.error },
        ...entry.context && { context: entry.context },
        ...entry.metadata && { metadata: entry.metadata },
        timestamp: entry.timestamp,
      }),
    });
  }

  private async sendBatchToLogDNA(entries: AggregatedLogEntry[]): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) return;

    for (const entry of entries) {
      await this.sendToLogDNA(entry);
    }
  }

  /**
   * Send to custom endpoint
   */
  private async sendToCustom(entry: AggregatedLogEntry): Promise<void> {
    if (!this.config.endpoint) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(entry),
    });
  }

  private async sendBatchToCustom(entries: AggregatedLogEntry[]): Promise<void> {
    if (!this.config.endpoint) return;

    await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({ entries }),
    });
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized: LogContext = {};
    const sensitiveKeys = ['password', 'token', 'apikey', 'authorization', 'secret', 'key', 'credential'];

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Extract user ID from context
   */
  private extractUserId(context?: LogContext): string | undefined {
    if (!context) return undefined;
    return context.userId as string | undefined ||
           context.user_id as string | undefined ||
           context.id as string | undefined;
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('log_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('log_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get request ID from context or generate one
   */
  private getRequestId(): string | undefined {
    // Try to get from context if available
    // Otherwise generate a simple ID
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convenience methods
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, error, context);
  }
}

// Singleton instance
export const logAggregator = new LogAggregator();

// Export integration function for manual setup
// This is called from logger.ts to avoid circular dependencies
export function integrateWithLogger(loggerInstance: {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error, context?: LogContext) => void;
}): void {
  if (import.meta.env.VITE_LOG_AGGREGATION_ENABLED !== 'true') {
    return;
  }

  const originalDebug = loggerInstance.debug.bind(loggerInstance);
  const originalInfo = loggerInstance.info.bind(loggerInstance);
  const originalWarn = loggerInstance.warn.bind(loggerInstance);
  const originalError = loggerInstance.error.bind(loggerInstance);

  loggerInstance.debug = (message: string, context?: LogContext) => {
    originalDebug(message, context);
    logAggregator.debug(message, context);
  };

  loggerInstance.info = (message: string, context?: LogContext) => {
    originalInfo(message, context);
    logAggregator.info(message, context);
  };

  loggerInstance.warn = (message: string, context?: LogContext) => {
    originalWarn(message, context);
    logAggregator.warn(message, context);
  };

  loggerInstance.error = (message: string, error?: Error, context?: LogContext) => {
    originalError(message, error, context);
    logAggregator.error(message, error, context);
  };
}

