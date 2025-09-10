/**
 * @fileoverview Enterprise Logger Utility
 * 
 * Professional logging utility that replaces console.log statements with
 * structured, configurable logging following enterprise patterns.
 * 
 * Features:
 * - Environment-aware logging levels
 * - Structured log format with context
 * - Production-safe error handling
 * - Integration-ready for monitoring services
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Log context interface
 */
export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  propertyId?: string | number;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxRetries: number;
  component: string;
}

/**
 * Enterprise Logger class
 */
export class PropertyLogger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private isFlushingQueue: boolean = false;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: this.getEnvironmentLogLevel(),
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
      maxRetries: 3,
      component: 'PropertyComponent',
      ...config
    };
  }

  /**
   * Get log level based on environment
   */
  private getEnvironmentLogLevel(): LogLevel {
    const envLevel = process.env.NODE_ENV;
    switch (envLevel) {
      case 'development':
        return LogLevel.DEBUG;
      case 'test':
        return LogLevel.WARN;
      case 'production':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const baseContext: LogContext = {
      component: this.config.component,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      ...context
    };

    return {
      level,
      message,
      context: baseContext,
      error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Format log message for console
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelName = levelNames[entry.level];
    
    let message = `[${levelName}] ${entry.context?.component || 'PropertyComponent'}`;
    
    if (entry.context?.action) {
      message += `:${entry.context.action}`;
    }
    
    message += ` - ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 3) {
      const contextCopy = { ...entry.context };
      delete contextCopy.component;
      delete contextCopy.timestamp;
      delete contextCopy.userAgent;
      delete contextCopy.url;
      
      if (Object.keys(contextCopy).length > 0) {
        message += ` | Context: ${JSON.stringify(contextCopy)}`;
      }
    }
    
    return message;
  }

  /**
   * Log to console (development)
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const message = this.formatConsoleMessage(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error) {
          console.error('Error details:', entry.error);
        }
        break;
    }
  }

  /**
   * Queue log for remote sending
   */
  private queueForRemote(entry: LogEntry): void {
    if (!this.config.enableRemote) return;
    
    this.logQueue.push(entry);
    
    // Flush queue if it gets too large
    if (this.logQueue.length >= 10) {
      this.flushQueue();
    }
  }

  /**
   * Flush log queue to remote endpoint
   */
  private async flushQueue(): Promise<void> {
    if (this.isFlushingQueue || this.logQueue.length === 0) return;
    
    this.isFlushingQueue = true;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToSend,
            source: 'property-components',
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      // Silently fail remote logging to avoid affecting user experience
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send logs to remote endpoint:', error);
      }
      
      // Re-queue logs for retry (with limit)
      if (logsToSend.length < 100) {
        this.logQueue.unshift(...logsToSend);
      }
    } finally {
      this.isFlushingQueue = false;
    }
  }

  /**
   * Main logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    
    this.logToConsole(entry);
    this.queueForRemote(entry);
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Property-specific logging helpers
   */
  
  /**
   * Log property interaction
   */
  logPropertyAction(
    action: string,
    propertyId: string | number,
    additionalContext?: LogContext
  ): void {
    this.info(`Property ${action}`, {
      action,
      propertyId,
      ...additionalContext
    });
  }

  /**
   * Log booking action
   */
  logBookingAction(
    action: string,
    propertyId: string | number,
    bookingData?: any,
    additionalContext?: LogContext
  ): void {
    this.info(`Booking ${action}`, {
      action: `booking_${action}`,
      propertyId,
      bookingData: bookingData ? { 
        total: bookingData.total, 
        nights: bookingData.nights,
        guests: bookingData.guests?.adults + bookingData.guests?.children 
      } : undefined,
      ...additionalContext
    });
  }

  /**
   * Log search action
   */
  logSearchAction(
    action: string,
    searchParams?: any,
    resultCount?: number,
    additionalContext?: LogContext
  ): void {
    this.info(`Search ${action}`, {
      action: `search_${action}`,
      searchParams: searchParams ? {
        location: searchParams.location,
        guests: searchParams.guests,
        priceRange: searchParams.minPrice && searchParams.maxPrice 
          ? `${searchParams.minPrice}-${searchParams.maxPrice}` 
          : undefined
      } : undefined,
      resultCount,
      ...additionalContext
    });
  }

  /**
   * Log API error
   */
  logApiError(
    endpoint: string,
    method: string,
    error: Error,
    additionalContext?: LogContext
  ): void {
    this.error(`API request failed: ${method} ${endpoint}`, {
      action: 'api_request_failed',
      endpoint,
      method,
      ...additionalContext
    }, error);
  }

  /**
   * Log performance metric
   */
  logPerformance(
    operation: string,
    duration: number,
    additionalContext?: LogContext
  ): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, {
      action: 'performance_metric',
      operation,
      duration,
      ...additionalContext
    });
  }

  /**
   * Flush remaining logs (call on app unmount)
   */
  async flush(): Promise<void> {
    await this.flushQueue();
  }
}

// Create default logger instances
const defaultLogger = new PropertyLogger();

// Export convenient logging functions
export const logger = {
  debug: (message: string, context?: LogContext) => defaultLogger.debug(message, context),
  info: (message: string, context?: LogContext) => defaultLogger.info(message, context),
  warn: (message: string, context?: LogContext, error?: Error) => defaultLogger.warn(message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => defaultLogger.error(message, context, error),
  fatal: (message: string, context?: LogContext, error?: Error) => defaultLogger.fatal(message, context, error),
  
  // Property-specific helpers
  property: {
    action: (action: string, propertyId: string | number, context?: LogContext) => 
      defaultLogger.logPropertyAction(action, propertyId, context),
    booking: (action: string, propertyId: string | number, bookingData?: any, context?: LogContext) => 
      defaultLogger.logBookingAction(action, propertyId, bookingData, context),
    search: (action: string, searchParams?: any, resultCount?: number, context?: LogContext) => 
      defaultLogger.logSearchAction(action, searchParams, resultCount, context),
    api: (endpoint: string, method: string, error: Error, context?: LogContext) => 
      defaultLogger.logApiError(endpoint, method, error, context),
    performance: (operation: string, duration: number, context?: LogContext) => 
      defaultLogger.logPerformance(operation, duration, context),
  },
  
  flush: () => defaultLogger.flush()
};

// Create specialized loggers for different components
export const createComponentLogger = (componentName: string): PropertyLogger => {
  return new PropertyLogger({ component: componentName });
};

export default logger;