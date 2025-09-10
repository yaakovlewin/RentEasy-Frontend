/**
 * ApiMonitor - Request logging, performance monitoring, and error tracking service
 * Provides comprehensive observability for API operations
 */
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  size?: number;
  cached?: boolean;
  retryCount?: number;
  error?: ApiErrorMetrics;
}

export interface ApiErrorMetrics {
  type: 'network' | 'timeout' | 'server' | 'client' | 'unknown';
  message: string;
  status?: number;
  code?: string;
  stack?: string;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: RequestMetrics | null;
  fastestRequest: RequestMetrics | null;
  errorRate: number;
  retryRate: number;
  cacheHitRate: number;
}

export interface MonitorConfig {
  enableLogging: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxRequestHistory: number;
  performanceThresholds: {
    slow: number; // ms
    veryslow: number; // ms
  };
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type RequestListener = (metrics: RequestMetrics) => void;
type ErrorListener = (error: ApiErrorMetrics, metrics: RequestMetrics) => void;

class ApiMonitor {
  private config: MonitorConfig;
  private requestHistory: RequestMetrics[] = [];
  private activeRequests = new Map<string, RequestMetrics>();
  private requestListeners = new Set<RequestListener>();
  private errorListeners = new Set<ErrorListener>();
  
  // Error suppression for development (reduce noise from expected failures)
  private errorSuppressionMap = new Map<string, number>();

  // Performance tracking
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private totalResponseTime = 0;
  private retryCount = 0;
  private cacheHits = 0;

  constructor(config?: Partial<MonitorConfig>) {
    this.config = {
      enableLogging: process.env.NODE_ENV === 'development',
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
      maxRequestHistory: 1000,
      performanceThresholds: {
        slow: 1000, // 1 second
        veryslow: 3000, // 3 seconds
      },
      ...config,
    };
  }

  /**
   * Start monitoring a request
   */
  startRequest(config: AxiosRequestConfig): string {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const metrics: RequestMetrics = {
      requestId,
      method: (config.method || 'GET').toUpperCase(),
      url: this.cleanUrl(config.url || ''),
      startTime,
    };

    this.activeRequests.set(requestId, metrics);
    this.totalRequests++;

    if (this.config.enableLogging) {
      this.log('debug', `Request started: ${metrics.method} ${metrics.url}`, {
        requestId,
        config,
      });
    }

    return requestId;
  }

  /**
   * Complete a successful request
   */
  completeRequest(
    requestId: string,
    response: AxiosResponse,
    options: { cached?: boolean; retryCount?: number } = {}
  ): void {
    const metrics = this.activeRequests.get(requestId);
    if (!metrics) return;

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;

    // Update metrics
    metrics.endTime = endTime;
    metrics.duration = duration;
    metrics.status = response.status;
    metrics.size = this.estimateResponseSize(response);
    metrics.cached = options.cached || false;
    metrics.retryCount = options.retryCount || 0;

    // Update counters
    this.successfulRequests++;
    this.totalResponseTime += duration;
    if (options.cached) this.cacheHits++;
    if (options.retryCount && options.retryCount > 0) this.retryCount++;

    // Performance analysis
    this.analyzePerformance(metrics);

    // Logging
    if (this.config.enableLogging) {
      const level = this.getLogLevelForRequest(metrics);
      this.log(level, `Request completed: ${metrics.method} ${metrics.url}`, {
        requestId,
        status: metrics.status,
        duration: `${duration}ms`,
        cached: metrics.cached,
        retryCount: metrics.retryCount,
      });
    }

    this.finalizeRequest(requestId, metrics);
  }

  /**
   * Handle request error
   */
  handleError(requestId: string, error: AxiosError): void {
    const metrics = this.activeRequests.get(requestId);
    if (!metrics) return;

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;

    // Update metrics
    metrics.endTime = endTime;
    metrics.duration = duration;
    metrics.status = error.response?.status;
    metrics.error = this.analyzeError(error);

    // Update counters
    this.failedRequests++;
    this.totalResponseTime += duration;

    // Error tracking
    if (this.config.enableErrorTracking) {
      this.notifyErrorListeners(metrics.error, metrics);
    }

    // Logging
    if (this.config.enableLogging) {
      this.log('error', `Request failed: ${metrics.method} ${metrics.url}`, {
        requestId,
        error: metrics.error,
        duration: `${duration}ms`,
      });
    }

    this.finalizeRequest(requestId, metrics);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const averageResponseTime =
      this.totalRequests > 0 ? Math.round(this.totalResponseTime / this.totalRequests) : 0;

    const errorRate = this.totalRequests > 0 ? this.failedRequests / this.totalRequests : 0;

    const retryRate = this.totalRequests > 0 ? this.retryCount / this.totalRequests : 0;

    const cacheHitRate = this.totalRequests > 0 ? this.cacheHits / this.totalRequests : 0;

    // Find slowest and fastest requests
    const completedRequests = this.requestHistory.filter(r => r.duration !== undefined);
    const slowestRequest = completedRequests.reduce(
      (slowest, current) => (!slowest || current.duration! > slowest.duration! ? current : slowest),
      null as RequestMetrics | null
    );

    const fastestRequest = completedRequests.reduce(
      (fastest, current) => (!fastest || current.duration! < fastest.duration! ? current : fastest),
      null as RequestMetrics | null
    );

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      averageResponseTime,
      slowestRequest,
      fastestRequest,
      errorRate,
      retryRate,
      cacheHitRate,
    };
  }

  /**
   * Get request history
   */
  getRequestHistory(limit?: number): RequestMetrics[] {
    const history = [...this.requestHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get active requests
   */
  getActiveRequests(): RequestMetrics[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Subscribe to request events
   */
  onRequest(listener: RequestListener): () => void {
    this.requestListeners.add(listener);
    return () => this.requestListeners.delete(listener);
  }

  /**
   * Subscribe to error events
   */
  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Clear all metrics and history
   */
  reset(): void {
    this.requestHistory.length = 0;
    this.activeRequests.clear();
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalResponseTime = 0;
    this.retryCount = 0;
    this.cacheHits = 0;
  }

  /**
   * Export metrics data for analysis
   */
  exportMetrics(): {
    performance: PerformanceMetrics;
    requestHistory: RequestMetrics[];
    config: MonitorConfig;
  } {
    return {
      performance: this.getPerformanceMetrics(),
      requestHistory: this.getRequestHistory(),
      config: this.config,
    };
  }

  // Private methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private cleanUrl(url: string): string {
    // Remove sensitive information from URLs
    return url.replace(/([?&])(token|key|secret)=[^&]*/gi, '$1$2=***');
  }

  private estimateResponseSize(response: AxiosResponse): number {
    try {
      if (response.headers['content-length']) {
        return parseInt(response.headers['content-length'], 10);
      }
      // Rough estimate
      return JSON.stringify(response.data).length;
    } catch {
      return 0;
    }
  }

  private analyzeError(error: AxiosError): ApiErrorMetrics {
    let type: ApiErrorMetrics['type'] = 'unknown';

    if (error.code === 'ECONNABORTED') {
      type = 'timeout';
    } else if (!error.response) {
      type = 'network';
    } else if (error.response.status >= 500) {
      type = 'server';
    } else if (error.response.status >= 400) {
      type = 'client';
    }

    return {
      type,
      message: error.message,
      status: error.response?.status,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  private analyzePerformance(metrics: RequestMetrics): void {
    if (!metrics.duration) return;

    const { slow, veryslow } = this.config.performanceThresholds;

    if (metrics.duration > veryslow) {
      this.log('warn', `Very slow request detected: ${metrics.method} ${metrics.url}`, {
        duration: `${metrics.duration}ms`,
        threshold: `${veryslow}ms`,
      });
    } else if (metrics.duration > slow) {
      this.log('info', `Slow request detected: ${metrics.method} ${metrics.url}`, {
        duration: `${metrics.duration}ms`,
        threshold: `${slow}ms`,
      });
    }
  }

  private getLogLevelForRequest(metrics: RequestMetrics): LogLevel {
    if (metrics.error) return 'error';
    if (metrics.status && metrics.status >= 400) return 'warn';
    if (metrics.duration && metrics.duration > this.config.performanceThresholds.slow)
      return 'warn';
    return 'debug';
  }

  private finalizeRequest(requestId: string, metrics: RequestMetrics): void {
    // Remove from active requests
    this.activeRequests.delete(requestId);

    // Add to history
    this.addToHistory(metrics);

    // Notify listeners
    this.notifyRequestListeners(metrics);
  }

  private addToHistory(metrics: RequestMetrics): void {
    this.requestHistory.push(metrics);

    // Maintain history size limit
    if (this.requestHistory.length > this.config.maxRequestHistory) {
      this.requestHistory.shift();
    }
  }

  private notifyRequestListeners(metrics: RequestMetrics): void {
    this.requestListeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in request listener:', error);
      }
    });
  }

  private notifyErrorListeners(error: ApiErrorMetrics, metrics: RequestMetrics): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error, metrics);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    // Check if this is an expected error (backend unavailable) and reduce noise
    const isExpectedError = this.isExpectedError(data);
    
    // In development, reduce noise from expected backend connection failures
    if (isExpectedError && level === 'error' && process.env.NODE_ENV === 'development') {
      // Create a more robust error key that handles undefined values
      const method = data?.config?.method || 'UNKNOWN';
      const url = data?.config?.url || data?.config?.baseURL || '';
      const errorCode = data?.error?.code || 'UNKNOWN';
      const errorKey = `${method}:${url}:${errorCode}`;
      
      const now = Date.now();
      const lastLogged = this.errorSuppressionMap.get(errorKey) || 0;
      
      // Suppress repeat errors within 30 seconds
      if (now - lastLogged < 30000) {
        return;
      }
      
      this.errorSuppressionMap.set(errorKey, now);
      
      // Log as debug instead of error for expected failures (only first occurrence)
      console.debug(`[ApiMonitor] ${message} (Backend unavailable - using fallback data)`, {
        ...logData,
        suppressed: true,
        note: 'Similar errors suppressed for 30s',
        errorKey: errorKey
      });
      return;
    }

    switch (level) {
      case 'error':
        console.error(`[ApiMonitor] ${message}`, logData);
        break;
      case 'warn':
        console.warn(`[ApiMonitor] ${message}`, logData);
        break;
      case 'info':
        console.info(`[ApiMonitor] ${message}`, logData);
        break;
      case 'debug':
        console.debug(`[ApiMonitor] ${message}`, logData);
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableLogging) return false;

    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    return messageLevel >= currentLevelIndex;
  }

  /**
   * Determines if an error is expected (like backend unavailable) to reduce console noise
   */
  private isExpectedError(data?: any): boolean {
    if (!data?.error) return false;

    const error = data.error;
    
    // Common expected error patterns
    const expectedErrorCodes = [
      'ECONNREFUSED', // Backend server not running
      'ENOTFOUND',    // DNS resolution failed
      'ETIMEDOUT',    // Request timeout
      'ECONNRESET',   // Connection reset
    ];

    const expectedErrorMessages = [
      'Network Error',
      'connect ECONNREFUSED',
      'Request failed with status',
    ];

    // Check error code
    if (expectedErrorCodes.includes(error.code)) {
      return true;
    }

    // Check error message
    if (expectedErrorMessages.some(msg => error.message?.includes(msg))) {
      return true;
    }

    // Check if this is localhost API call (development)
    const url = data?.config?.baseURL || data?.config?.url;
    if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const apiMonitor = new ApiMonitor();

export { ApiMonitor };
export default apiMonitor;
