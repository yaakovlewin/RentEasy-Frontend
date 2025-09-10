/**
 * @fileoverview BaseErrorBoundary
 * 
 * Enterprise-grade error boundary system with classification, recovery strategies,
 * and monitoring integration following patterns from Netflix, Google, and Facebook.
 * 
 * Features comprehensive error handling, user-friendly fallbacks, retry mechanisms,
 * and production-ready error monitoring.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { logger } from '../utils/Logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  COMPONENT = 'component',
  API = 'api',
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  REDIRECT = 'redirect',
  RELOAD = 'reload',
  IGNORE = 'ignore',
}

/**
 * Error boundary context information
 */
export interface ErrorBoundaryContext {
  componentName: string;
  featureName?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  metadata?: Record<string, any>;
}

/**
 * Classified error information
 */
export interface ClassifiedError {
  originalError: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoveryStrategy: RecoveryStrategy;
  context: ErrorBoundaryContext;
  timestamp: Date;
  errorId: string;
  retryable: boolean;
  userFriendlyMessage: string;
  technicalDetails?: string;
}

/**
 * Error boundary configuration
 */
export interface ErrorBoundaryConfig {
  /** Component name for logging */
  componentName: string;
  /** Feature name for categorization */
  featureName?: string;
  /** Fallback UI component */
  fallbackComponent?: React.ComponentType<ErrorBoundaryFallbackProps>;
  /** Enable retry functionality */
  enableRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Recovery strategy */
  recoveryStrategy?: RecoveryStrategy;
  /** Custom error classification */
  classifyError?: (error: Error, errorInfo: ErrorInfo) => Partial<ClassifiedError>;
  /** Error monitoring callback */
  onError?: (classifiedError: ClassifiedError) => void;
  /** Custom recovery actions */
  recoveryActions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ComponentType;
  }>;
  /** Show technical details in development */
  showTechnicalDetails?: boolean;
  /** Custom error messages by category */
  customMessages?: Partial<Record<ErrorCategory, string>>;
}

/**
 * Error boundary fallback component props
 */
export interface ErrorBoundaryFallbackProps {
  error: ClassifiedError;
  retry: () => void;
  canRetry: boolean;
  recoveryActions: ErrorBoundaryConfig['recoveryActions'];
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: ClassifiedError | null;
  retryCount: number;
  errorId: string | null;
}

/**
 * Error classification engine
 */
class ErrorClassifier {
  /**
   * Classify error based on message, stack trace, and context
   */
  static classifyError(
    error: Error, 
    errorInfo: ErrorInfo, 
    context: ErrorBoundaryContext
  ): ClassifiedError {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    // Determine category
    const category = this.determineCategory(error, errorMessage, errorStack);
    
    // Determine severity
    const severity = this.determineSeverity(category, errorMessage, context);
    
    // Determine recovery strategy
    const recoveryStrategy = this.determineRecoveryStrategy(category, severity);
    
    // Generate user-friendly message
    const userFriendlyMessage = this.generateUserFriendlyMessage(category, error);
    
    // Check if retryable
    const retryable = this.isRetryable(category, error);
    
    return {
      originalError: error,
      severity,
      category,
      recoveryStrategy,
      context,
      timestamp: new Date(),
      errorId: this.generateErrorId(),
      retryable,
      userFriendlyMessage,
      technicalDetails: this.generateTechnicalDetails(error, errorInfo),
    };
  }
  
  /**
   * Determine error category
   */
  private static determineCategory(
    error: Error, 
    errorMessage: string, 
    errorStack: string
  ): ErrorCategory {
    // API errors
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') || 
        errorMessage.includes('api') ||
        errorMessage.includes('400') ||
        errorMessage.includes('500')) {
      return ErrorCategory.API;
    }
    
    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('cors')) {
      return ErrorCategory.NETWORK;
    }
    
    // Auth errors
    if (errorMessage.includes('unauthorized') || 
        errorMessage.includes('forbidden') ||
        errorMessage.includes('token') ||
        errorMessage.includes('auth')) {
      return ErrorCategory.AUTH;
    }
    
    // Permission errors
    if (errorMessage.includes('permission') || 
        errorMessage.includes('access denied') ||
        errorMessage.includes('not allowed')) {
      return ErrorCategory.PERMISSION;
    }
    
    // Validation errors
    if (errorMessage.includes('validation') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('required') ||
        error.name === 'ValidationError') {
      return ErrorCategory.VALIDATION;
    }
    
    // Component errors (React specific)
    if (errorStack.includes('react') || 
        errorMessage.includes('render') ||
        errorMessage.includes('component') ||
        errorMessage.includes('hook')) {
      return ErrorCategory.COMPONENT;
    }
    
    return ErrorCategory.UNKNOWN;
  }
  
  /**
   * Determine error severity
   */
  private static determineSeverity(
    category: ErrorCategory, 
    errorMessage: string, 
    context: ErrorBoundaryContext
  ): ErrorSeverity {
    // Critical errors that break core functionality
    if (category === ErrorCategory.AUTH || 
        errorMessage.includes('critical') ||
        errorMessage.includes('security') ||
        context.featureName === 'auth' ||
        context.featureName === 'payment') {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity for API and network issues
    if (category === ErrorCategory.API || 
        category === ErrorCategory.NETWORK ||
        errorMessage.includes('500') ||
        errorMessage.includes('database')) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity for component and validation errors
    if (category === ErrorCategory.COMPONENT || 
        category === ErrorCategory.VALIDATION ||
        category === ErrorCategory.PERMISSION) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity for minor issues
    return ErrorSeverity.LOW;
  }
  
  /**
   * Determine recovery strategy
   */
  private static determineRecoveryStrategy(
    category: ErrorCategory, 
    severity: ErrorSeverity
  ): RecoveryStrategy {
    // Critical auth errors require redirect
    if (category === ErrorCategory.AUTH && severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.REDIRECT;
    }
    
    // Network and API errors can be retried
    if (category === ErrorCategory.NETWORK || 
        category === ErrorCategory.API) {
      return RecoveryStrategy.RETRY;
    }
    
    // Component errors benefit from fallback UI
    if (category === ErrorCategory.COMPONENT) {
      return RecoveryStrategy.FALLBACK;
    }
    
    // Permission errors should show appropriate message
    if (category === ErrorCategory.PERMISSION) {
      return RecoveryStrategy.FALLBACK;
    }
    
    // Critical system errors may require reload
    if (severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.RELOAD;
    }
    
    // Default to retry for most errors
    return RecoveryStrategy.RETRY;
  }
  
  /**
   * Generate user-friendly error message
   */
  private static generateUserFriendlyMessage(
    category: ErrorCategory, 
    error: Error
  ): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.COMPONENT]: 'Something went wrong with this feature. Please try again.',
      [ErrorCategory.API]: 'We\'re having trouble connecting to our servers. Please check your connection and try again.',
      [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ErrorCategory.AUTH]: 'Authentication issue. Please sign in again.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.PERMISSION]: 'You don\'t have permission to access this feature.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    
    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }
  
  /**
   * Check if error is retryable
   */
  private static isRetryable(category: ErrorCategory, error: Error): boolean {
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.API,
      ErrorCategory.COMPONENT,
    ];
    
    // Don't retry auth or permission errors
    if (category === ErrorCategory.AUTH || 
        category === ErrorCategory.PERMISSION) {
      return false;
    }
    
    // Don't retry validation errors
    if (category === ErrorCategory.VALIDATION) {
      return false;
    }
    
    return retryableCategories.includes(category);
  }
  
  /**
   * Generate unique error ID
   */
  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Generate technical details for debugging
   */
  private static generateTechnicalDetails(error: Error, errorInfo: ErrorInfo): string {
    return [
      `Error: ${error.name}: ${error.message}`,
      `Stack: ${error.stack}`,
      `Component Stack: ${errorInfo.componentStack}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n\n');
  }
}

/**
 * Default error boundary fallback component
 */
const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  retry,
  canRetry,
  recoveryActions = [],
}) => {
  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'border-red-500 bg-red-50';
      case ErrorSeverity.HIGH:
        return 'border-orange-500 bg-orange-50';
      case ErrorSeverity.MEDIUM:
        return 'border-yellow-500 bg-yellow-50';
      case ErrorSeverity.LOW:
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };
  
  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <Bug className="w-6 h-6 text-gray-500" />;
    }
  };
  
  return (
    <Card className={cn('border-2', getSeverityColor(error.severity))}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getSeverityIcon(error.severity)}
        </div>
        <CardTitle className="text-lg font-semibold">
          Oops! Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          {error.userFriendlyMessage}
        </p>
        
        {/* Error ID for support */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Error ID: {error.errorId}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {canRetry && (
            <Button
              variant="default"
              onClick={retry}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          
          {recoveryActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="flex items-center gap-2"
            >
              {action.icon && <action.icon />}
              {action.label}
            </Button>
          ))}
          
          {/* Default recovery actions */}
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
        
        {/* Technical details in development */}
        {process.env.NODE_ENV === 'development' && error.technicalDetails && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
              {error.technicalDetails}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Main BaseErrorBoundary component
 */
export class BaseErrorBoundary extends Component<
  ErrorBoundaryConfig & { children: ReactNode },
  ErrorBoundaryState
> {
  private retryTimeouts: Set<NodeJS.Timeout> = new Set();
  
  constructor(props: ErrorBoundaryConfig & { children: ReactNode }) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorId: null,
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context: ErrorBoundaryContext = {
      componentName: this.props.componentName,
      featureName: this.props.featureName,
      route: window.location.pathname,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount,
      },
    };
    
    // Classify the error
    let classifiedError = ErrorClassifier.classifyError(error, errorInfo, context);
    
    // Apply custom classification if provided
    if (this.props.classifyError) {
      const customClassification = this.props.classifyError(error, errorInfo);
      classifiedError = { ...classifiedError, ...customClassification };
    }
    
    // Apply custom messages if provided
    if (this.props.customMessages && this.props.customMessages[classifiedError.category]) {
      classifiedError.userFriendlyMessage = this.props.customMessages[classifiedError.category]!;
    }
    
    // Log error using our logging system
    logger.property.error(
      `Error boundary caught error in ${this.props.componentName}`,
      {
        error: classifiedError,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.componentName,
      },
      error
    );
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(classifiedError);
    }
    
    // Update state with classified error
    this.setState({ error: classifiedError });
    
    // Auto-retry for certain error types
    this.handleAutoRetry(classifiedError);
  }
  
  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
  
  /**
   * Handle automatic retry based on error classification
   */
  private handleAutoRetry(error: ClassifiedError) {
    const { recoveryStrategy } = error;
    const { maxRetries = 3 } = this.props;
    
    if (recoveryStrategy === RecoveryStrategy.RETRY && 
        error.retryable && 
        this.state.retryCount < maxRetries) {
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const retryDelay = Math.pow(2, this.state.retryCount) * 1000;
      
      const timeout = setTimeout(() => {
        this.retryTimeouts.delete(timeout);
        this.retry();
      }, retryDelay);
      
      this.retryTimeouts.add(timeout);
    }
  }
  
  /**
   * Manual retry method
   */
  retry = () => {
    logger.property.info('Error boundary retry attempt', {
      componentName: this.props.componentName,
      retryCount: this.state.retryCount + 1,
      errorId: this.state.errorId,
    });
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
      errorId: null,
    }));
  };
  
  /**
   * Check if retry is allowed
   */
  private canRetry(): boolean {
    const { enableRetry = true, maxRetries = 3 } = this.props;
    const { error, retryCount } = this.state;
    
    return enableRetry && 
           error?.retryable === true && 
           retryCount < maxRetries;
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.retry}
          canRetry={this.canRetry()}
          recoveryActions={this.props.recoveryActions}
        />
      );
    }
    
    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig: ErrorBoundaryConfig
) {
  const WrappedComponent = (props: P) => (
    <BaseErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </BaseErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error monitoring and reporting
 */
export function useErrorMonitoring() {
  const captureError = React.useCallback((
    error: Error,
    context?: Partial<ErrorBoundaryContext>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) => {
    const fullContext: ErrorBoundaryContext = {
      componentName: 'useErrorMonitoring',
      route: window.location.pathname,
      ...context,
    };
    
    const classifiedError = ErrorClassifier.classifyError(error, { componentStack: '' }, fullContext);
    classifiedError.severity = severity;
    
    logger.property.error('Manual error capture', { error: classifiedError }, error);
  }, []);
  
  const captureException = React.useCallback((
    message: string,
    metadata?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.LOW
  ) => {
    const error = new Error(message);
    const context: ErrorBoundaryContext = {
      componentName: 'useErrorMonitoring',
      route: window.location.pathname,
      metadata,
    };
    
    const classifiedError = ErrorClassifier.classifyError(error, { componentStack: '' }, context);
    classifiedError.severity = severity;
    
    logger.property.warn('Manual exception capture', { error: classifiedError });
  }, []);
  
  return { captureError, captureException };
}

/**
 * Specialized error boundaries for property components
 */

/**
 * Property feature error boundary
 */
export const PropertyFeatureErrorBoundary: React.FC<{
  children: ReactNode;
  featureName: string;
}> = ({ children, featureName }) => (
  <BaseErrorBoundary
    componentName="PropertyFeatureErrorBoundary"
    featureName={featureName}
    enableRetry={true}
    maxRetries={2}
    customMessages={{
      [ErrorCategory.API]: 'Unable to load property data. Please try again.',
      [ErrorCategory.NETWORK]: 'Network issue loading property information.',
      [ErrorCategory.COMPONENT]: 'Property display issue. Refreshing may help.',
    }}
    recoveryActions={[
      {
        label: 'Reload Property',
        action: () => window.location.reload(),
        icon: RefreshCcw,
      },
    ]}
  >
    {children}
  </BaseErrorBoundary>
);

/**
 * Property gallery error boundary
 */
export const PropertyGalleryErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <BaseErrorBoundary
    componentName="PropertyGalleryErrorBoundary"
    featureName="property-gallery"
    enableRetry={true}
    maxRetries={1}
    customMessages={{
      [ErrorCategory.API]: 'Unable to load property images.',
      [ErrorCategory.NETWORK]: 'Image loading failed. Check your connection.',
    }}
  >
    {children}
  </BaseErrorBoundary>
);

/**
 * Property booking error boundary
 */
export const PropertyBookingErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <BaseErrorBoundary
    componentName="PropertyBookingErrorBoundary"
    featureName="property-booking"
    enableRetry={false}
    customMessages={{
      [ErrorCategory.API]: 'Booking system temporarily unavailable.',
      [ErrorCategory.AUTH]: 'Please sign in to make a booking.',
      [ErrorCategory.VALIDATION]: 'Please check your booking details.',
    }}
  >
    {children}
  </BaseErrorBoundary>
);