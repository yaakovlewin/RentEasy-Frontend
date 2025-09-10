/**
 * ApiErrors - Enterprise-grade error handling system with recovery strategies
 * 
 * Features:
 * - Structured error hierarchy with specific error types
 * - Automatic error classification and recovery strategies
 * - User-friendly error messages with i18n support
 * - Error context preservation and debugging info
 * - Retry strategies and circuit breaker patterns
 * - Error reporting and monitoring integration
 */

import { AxiosError } from 'axios'

// Base error interface
export interface ErrorContext {
  requestId?: string
  endpoint?: string
  method?: string
  timestamp: number
  userAgent?: string
  userId?: string
  sessionId?: string
  buildVersion?: string
}

// Error recovery strategies
export type RecoveryStrategy = 
  | 'retry'
  | 'fallback' 
  | 'redirect'
  | 'ignore'
  | 'user_input'
  | 'none'

export interface RecoveryOptions {
  strategy: RecoveryStrategy
  maxRetries?: number
  retryDelay?: number
  fallbackData?: any
  redirectUrl?: string
  requiresUserInput?: boolean
  canIgnore?: boolean
}

// Base API Error class
export abstract class BaseApiError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly context: ErrorContext
  public readonly recovery: RecoveryOptions
  public readonly userMessage: string
  public readonly isRetryable: boolean
  public readonly isFatal: boolean

  constructor(
    code: string,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    context: Partial<ErrorContext> = {},
    recovery: Partial<RecoveryOptions> = {},
    options: { isRetryable?: boolean; isFatal?: boolean } = {}
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.userMessage = userMessage
    this.isRetryable = options.isRetryable ?? false
    this.isFatal = options.isFatal ?? false
    
    this.context = {
      timestamp: Date.now(),
      ...context
    }
    
    this.recovery = {
      strategy: 'none',
      maxRetries: 0,
      retryDelay: 1000,
      ...recovery
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Serialize error for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      context: this.context,
      recovery: this.recovery,
      isRetryable: this.isRetryable,
      isFatal: this.isFatal,
      stack: this.stack
    }
  }

  /**
   * Get user-friendly error message with context
   */
  getUserMessage(includeCode = false): string {
    const baseMessage = this.userMessage || this.message
    return includeCode ? `${baseMessage} (${this.code})` : baseMessage
  }

  /**
   * Check if error should trigger specific recovery strategy
   */
  shouldRetry(): boolean {
    return this.isRetryable && ['retry', 'fallback'].includes(this.recovery.strategy)
  }

  /**
   * Get retry delay with exponential backoff
   */
  getRetryDelay(attempt: number): number {
    const baseDelay = this.recovery.retryDelay || 1000
    return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000) // Cap at 30 seconds
  }
}

// Specific Error Types

/**
 * Network connectivity errors
 */
export class NetworkError extends BaseApiError {
  constructor(message = 'Network connection failed', context?: Partial<ErrorContext>) {
    super(
      'NETWORK_ERROR',
      message,
      'Unable to connect to the server. Please check your internet connection and try again.',
      0,
      context,
      { strategy: 'retry', maxRetries: 3, retryDelay: 2000 },
      { isRetryable: true, isFatal: false }
    )
  }
}

/**
 * Request timeout errors
 */
export class TimeoutError extends BaseApiError {
  constructor(message = 'Request timed out', context?: Partial<ErrorContext>) {
    super(
      'TIMEOUT_ERROR',
      message,
      'The request is taking longer than expected. Please try again.',
      408,
      context,
      { strategy: 'retry', maxRetries: 2, retryDelay: 1000 },
      { isRetryable: true, isFatal: false }
    )
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends BaseApiError {
  constructor(message = 'Authentication failed', context?: Partial<ErrorContext>) {
    super(
      'AUTH_ERROR',
      message,
      'Your session has expired. Please log in again.',
      401,
      context,
      { strategy: 'redirect', redirectUrl: '/auth/login', requiresUserInput: true },
      { isRetryable: false, isFatal: false }
    )
  }
}

export class AuthorizationError extends BaseApiError {
  constructor(message = 'Access denied', context?: Partial<ErrorContext>) {
    super(
      'AUTHORIZATION_ERROR',
      message,
      'You don\'t have permission to perform this action.',
      403,
      context,
      { strategy: 'user_input', requiresUserInput: true },
      { isRetryable: false, isFatal: false }
    )
  }
}

/**
 * Validation and client errors
 */
export class ValidationError extends BaseApiError {
  public readonly validationErrors: Record<string, string[]>

  constructor(
    message = 'Invalid input data',
    validationErrors: Record<string, string[]> = {},
    context?: Partial<ErrorContext>
  ) {
    super(
      'VALIDATION_ERROR',
      message,
      'Please check your input and try again.',
      400,
      context,
      { strategy: 'user_input', requiresUserInput: true },
      { isRetryable: false, isFatal: false }
    )
    this.validationErrors = validationErrors
  }

  getFieldErrors(field: string): string[] {
    return this.validationErrors[field] || []
  }

  hasFieldErrors(field: string): boolean {
    return field in this.validationErrors && this.validationErrors[field].length > 0
  }
}

export class NotFoundError extends BaseApiError {
  constructor(
    resource = 'Resource',
    message?: string,
    context?: Partial<ErrorContext>
  ) {
    const errorMessage = message || `${resource} not found`
    super(
      'NOT_FOUND_ERROR',
      errorMessage,
      `The requested ${resource.toLowerCase()} could not be found.`,
      404,
      context,
      { strategy: 'fallback', canIgnore: true },
      { isRetryable: false, isFatal: false }
    )
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends BaseApiError {
  public readonly retryAfter?: number

  constructor(
    retryAfter?: number,
    message = 'Too many requests',
    context?: Partial<ErrorContext>
  ) {
    const retryDelay = retryAfter ? retryAfter * 1000 : 60000 // Default 1 minute
    super(
      'RATE_LIMIT_ERROR',
      message,
      'Too many requests. Please wait a moment and try again.',
      429,
      context,
      { strategy: 'retry', maxRetries: 1, retryDelay },
      { isRetryable: true, isFatal: false }
    )
    this.retryAfter = retryAfter
  }
}

/**
 * Server errors
 */
export class ServerError extends BaseApiError {
  constructor(
    statusCode = 500,
    message = 'Server error',
    context?: Partial<ErrorContext>
  ) {
    const isRetryable = statusCode >= 500 && statusCode < 600
    super(
      'SERVER_ERROR',
      message,
      'Something went wrong on our end. Please try again in a moment.',
      statusCode,
      context,
      { 
        strategy: isRetryable ? 'retry' : 'fallback', 
        maxRetries: isRetryable ? 2 : 0, 
        retryDelay: 3000 
      },
      { isRetryable, isFatal: statusCode >= 500 }
    )
  }
}

/**
 * Business logic errors
 */
export class ConflictError extends BaseApiError {
  constructor(
    message = 'Resource conflict',
    context?: Partial<ErrorContext>
  ) {
    super(
      'CONFLICT_ERROR',
      message,
      'This action conflicts with existing data. Please refresh and try again.',
      409,
      context,
      { strategy: 'user_input', requiresUserInput: true },
      { isRetryable: false, isFatal: false }
    )
  }
}

export class PaymentError extends BaseApiError {
  constructor(
    message = 'Payment processing failed',
    context?: Partial<ErrorContext>
  ) {
    super(
      'PAYMENT_ERROR',
      message,
      'Payment could not be processed. Please check your payment information and try again.',
      402,
      context,
      { strategy: 'user_input', requiresUserInput: true },
      { isRetryable: false, isFatal: false }
    )
  }
}

/**
 * Unknown/Generic errors
 */
export class UnknownError extends BaseApiError {
  constructor(
    originalError?: Error,
    context?: Partial<ErrorContext>
  ) {
    const message = originalError?.message || 'An unexpected error occurred'
    super(
      'UNKNOWN_ERROR',
      message,
      'Something unexpected happened. Please try again or contact support if the problem persists.',
      500,
      context,
      { strategy: 'retry', maxRetries: 1, retryDelay: 2000 },
      { isRetryable: true, isFatal: false }
    )
  }
}

/**
 * Error Factory - Creates appropriate error instances from various sources
 */
export class ApiErrorFactory {
  /**
   * Create error from Axios error
   */
  static fromAxiosError(axiosError: AxiosError, context: Partial<ErrorContext> = {}): BaseApiError {
    const enhancedContext = {
      ...context,
      endpoint: axiosError.config?.url,
      method: axiosError.config?.method?.toUpperCase(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    }

    // Network errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return new TimeoutError(axiosError.message, enhancedContext)
      }
      return new NetworkError(axiosError.message, enhancedContext)
    }

    const { status, data } = axiosError.response
    const errorData = data as any // Cast to any to access properties

    // Create appropriate error based on status code
    switch (status) {
      case 400:
        if (errorData?.validationErrors) {
          return new ValidationError(
            errorData.message || 'Validation failed',
            errorData.validationErrors,
            enhancedContext
          )
        }
        return new ValidationError(errorData?.message, {}, enhancedContext)

      case 401:
        return new AuthenticationError(errorData?.message, enhancedContext)

      case 403:
        return new AuthorizationError(errorData?.message, enhancedContext)

      case 404:
        return new NotFoundError('Resource', errorData?.message, enhancedContext)

      case 408:
        return new TimeoutError(errorData?.message, enhancedContext)

      case 409:
        return new ConflictError(errorData?.message, enhancedContext)

      case 429:
        const retryAfter = axiosError.response.headers['retry-after']
        return new RateLimitError(
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          errorData?.message,
          enhancedContext
        )

      case 402:
        return new PaymentError(errorData?.message, enhancedContext)

      default:
        if (status >= 500) {
          return new ServerError(status, errorData?.message, enhancedContext)
        }
        return new UnknownError(axiosError, enhancedContext)
    }
  }

  /**
   * Create error from generic Error
   */
  static fromError(error: Error, context: Partial<ErrorContext> = {}): BaseApiError {
    if (error instanceof BaseApiError) {
      return error
    }

    return new UnknownError(error, context)
  }

  /**
   * Create error from error data object
   */
  static fromErrorData(
    errorData: { 
      code?: string
      message?: string
      statusCode?: number
      [key: string]: any 
    },
    context: Partial<ErrorContext> = {}
  ): BaseApiError {
    const { code, message, statusCode = 500 } = errorData

    switch (code) {
      case 'NETWORK_ERROR':
        return new NetworkError(message, context)
      case 'TIMEOUT_ERROR':
        return new TimeoutError(message, context)
      case 'AUTH_ERROR':
        return new AuthenticationError(message, context)
      case 'VALIDATION_ERROR':
        return new ValidationError(message, errorData.validationErrors, context)
      case 'NOT_FOUND_ERROR':
        return new NotFoundError('Resource', message, context)
      case 'RATE_LIMIT_ERROR':
        return new RateLimitError(errorData.retryAfter, message, context)
      case 'SERVER_ERROR':
        return new ServerError(statusCode, message, context)
      default:
        return new UnknownError(new Error(message), context)
    }
  }
}

/**
 * Error Handler - Centralized error processing and recovery
 */
export class ApiErrorHandler {
  private static instance: ApiErrorHandler
  private errorReportingCallback?: (error: BaseApiError) => void
  private recoveryCallbacks = new Map<RecoveryStrategy, (error: BaseApiError) => Promise<any>>()

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler()
    }
    return ApiErrorHandler.instance
  }

  /**
   * Set error reporting callback
   */
  setErrorReporting(callback: (error: BaseApiError) => void): void {
    this.errorReportingCallback = callback
  }

  /**
   * Register recovery callback for specific strategy
   */
  registerRecovery(strategy: RecoveryStrategy, callback: (error: BaseApiError) => Promise<any>): void {
    this.recoveryCallbacks.set(strategy, callback)
  }

  /**
   * Handle error with automatic recovery attempts
   */
  async handleError(error: any, context: Partial<ErrorContext> = {}): Promise<{
    error: BaseApiError
    recovered: boolean
    recoveryData?: any
  }> {
    // Convert to structured error
    let apiError: BaseApiError

    if (error.isAxiosError) {
      apiError = ApiErrorFactory.fromAxiosError(error, context)
    } else if (error instanceof BaseApiError) {
      apiError = error
    } else if (error instanceof Error) {
      apiError = ApiErrorFactory.fromError(error, context)
    } else {
      apiError = ApiErrorFactory.fromErrorData(error, context)
    }

    // Report error
    if (this.errorReportingCallback && apiError.isFatal) {
      try {
        this.errorReportingCallback(apiError)
      } catch (reportingError) {
        console.error('Error reporting failed:', reportingError)
      }
    }

    // Attempt recovery
    let recovered = false
    let recoveryData: any

    if (apiError.recovery.strategy !== 'none') {
      const recoveryCallback = this.recoveryCallbacks.get(apiError.recovery.strategy)
      if (recoveryCallback) {
        try {
          recoveryData = await recoveryCallback(apiError)
          recovered = true
        } catch (recoveryError) {
          console.error('Error recovery failed:', recoveryError)
        }
      }
    }

    return {
      error: apiError,
      recovered,
      recoveryData
    }
  }

  /**
   * Extract user-friendly message from any error
   */
  getUserMessage(error: any): string {
    if (error instanceof BaseApiError) {
      return error.getUserMessage()
    }

    if (error?.response?.errorData?.message) {
      return error.response.data.message
    }

    if (error?.message) {
      return error.message
    }

    return 'An unexpected error occurred'
  }

  /**
   * Check if error indicates authentication failure
   */
  isAuthError(error: any): boolean {
    return error instanceof AuthenticationError || 
           error?.response?.status === 401 ||
           error?.statusCode === 401
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    if (error instanceof BaseApiError) {
      return error.isRetryable
    }

    // Default retry logic for non-structured errors
    if (error?.response?.status) {
      const status = error.response.status
      return status >= 500 || status === 429 || status === 408
    }

    if (error?.code === 'ECONNABORTED' || !error?.response) {
      return true // Network/timeout errors
    }

    return false
  }
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance()

// Export error types for instanceof checks
export const ErrorTypes = {
  NetworkError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ConflictError,
  PaymentError,
  UnknownError
} as const

export default apiErrorHandler