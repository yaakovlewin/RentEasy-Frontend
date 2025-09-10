/**
 * Error Monitoring & Recovery Strategies
 * 
 * Enterprise-grade error monitoring system with recovery strategies,
 * performance tracking, and integration points for external services.
 */

// Error types for classification
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  COMPONENT = 'component',
  AUTH = 'auth',
  VALIDATION = 'validation',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown',
}

// Error context interface
export interface ErrorContext {
  errorId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
  feature?: string;
  component?: string;
  action?: string;
}

// Error monitoring interface
export interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  stackTrace?: string;
  additionalData?: Record<string, any>;
}

// Recovery strategy interface
export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'ignore';
  maxAttempts?: number;
  delay?: number;
  fallbackComponent?: React.ComponentType;
  redirectUrl?: string;
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errorReports: ErrorReport[] = [];
  private performanceMetrics: Map<string, number> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();

  private constructor() {
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
  }

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, ErrorSeverity.HIGH, ErrorCategory.UNKNOWN, {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });
    }
  }

  /**
   * Setup unhandled promise rejection handler
   */
  private setupUnhandledRejectionHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          new Error(event.reason),
          ErrorSeverity.HIGH,
          ErrorCategory.NETWORK,
          {
            reason: event.reason,
            type: 'unhandledrejection',
          }
        );
      });
    }
  }

  /**
   * Capture and report errors
   */
  captureError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    additionalData?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId();
    const context = this.buildErrorContext(errorId);

    const report: ErrorReport = {
      error,
      severity,
      category,
      context,
      stackTrace: error.stack,
      additionalData,
    };

    // Store locally for debugging
    this.errorReports.push(report);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', report);
    }

    // In production, send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(report);
    }

    // Trigger recovery strategy if available
    this.executeRecoveryStrategy(category, error);

    return errorId;
  }

  /**
   * Build error context
   */
  private buildErrorContext(errorId: string): ErrorContext {
    const sessionId = this.getOrCreateSessionId();
    
    return {
      errorId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      sessionId,
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Send error report to external monitoring service
   */
  private async sendToExternalService(report: ErrorReport) {
    try {
      // Example integration points:
      // - Sentry: Sentry.captureException(report.error, { ...report.context });
      // - LogRocket: LogRocket.captureException(report.error);
      // - Custom API: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(report) });
      
      console.log('Would send to external service in production:', report);
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
    }
  }

  /**
   * Execute recovery strategy
   */
  private executeRecoveryStrategy(category: ErrorCategory, error: Error) {
    const strategy = this.recoveryStrategies.get(category.toString());
    if (!strategy) return;

    switch (strategy.type) {
      case 'retry':
        this.handleRetryStrategy(strategy, error);
        break;
      case 'fallback':
        this.handleFallbackStrategy(strategy);
        break;
      case 'redirect':
        this.handleRedirectStrategy(strategy);
        break;
      case 'ignore':
        console.log('Ignoring error as per strategy:', error.message);
        break;
    }
  }

  /**
   * Handle retry recovery strategy
   */
  private handleRetryStrategy(strategy: RecoveryStrategy, error: Error) {
    // Implementation depends on the specific error context
    console.log('Retry strategy triggered:', strategy, error.message);
  }

  /**
   * Handle fallback recovery strategy
   */
  private handleFallbackStrategy(strategy: RecoveryStrategy) {
    console.log('Fallback strategy triggered:', strategy);
  }

  /**
   * Handle redirect recovery strategy
   */
  private handleRedirectStrategy(strategy: RecoveryStrategy) {
    if (strategy.redirectUrl && typeof window !== 'undefined') {
      window.location.href = strategy.redirectUrl;
    }
  }

  /**
   * Register recovery strategy for error category
   */
  registerRecoveryStrategy(category: ErrorCategory, strategy: RecoveryStrategy) {
    this.recoveryStrategies.set(category.toString(), strategy);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number) {
    this.performanceMetrics.set(metric, value);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric: ${metric} = ${value}ms`);
    }
  }

  /**
   * Get error reports (for debugging)
   */
  getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  /**
   * Clear error reports
   */
  clearErrorReports() {
    this.errorReports = [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }
}

// Export singleton instance
export const errorMonitoring = ErrorMonitoringService.getInstance();

// Convenience functions
export const captureError = (
  error: Error,
  severity?: ErrorSeverity,
  category?: ErrorCategory,
  additionalData?: Record<string, any>
) => errorMonitoring.captureError(error, severity, category, additionalData);

export const trackPerformance = (metric: string, value: number) =>
  errorMonitoring.trackPerformance(metric, value);

export const registerRecoveryStrategy = (category: ErrorCategory, strategy: RecoveryStrategy) =>
  errorMonitoring.registerRecoveryStrategy(category, strategy);

// React hook for error monitoring
export const useErrorMonitoring = () => {
  return {
    captureError,
    trackPerformance,
    registerRecoveryStrategy,
    getErrorReports: () => errorMonitoring.getErrorReports(),
    getPerformanceMetrics: () => errorMonitoring.getPerformanceMetrics(),
  };
};

// Error boundary integration
export const withErrorMonitoring = (
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
) => {
  return captureError(error, ErrorSeverity.HIGH, ErrorCategory.COMPONENT, {
    componentName,
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
};