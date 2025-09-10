/**
 * @fileoverview Enterprise Authentication Type Definitions
 * 
 * Unified, enterprise-grade type definitions for authentication across frontend and backend.
 * This is the single source of truth for all authentication-related types.
 * 
 * Design Philosophy:
 * - Google/Netflix/Airbnb-tier type safety and consistency
 * - Backend compatibility with snake_case conversion
 * - Frontend developer experience with camelCase
 * - Comprehensive JWT and session management
 * - Enterprise security patterns
 */

// =============================================================================
// CORE USER TYPES
// =============================================================================

/**
 * Core user interface - Enterprise standard
 * Matches backend User model with comprehensive fields
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User role types for enterprise-grade RBAC
 * Hierarchical permissions: admin > staff > owner > guest
 */
export type UserRole = 'guest' | 'owner' | 'staff' | 'admin';

/**
 * Permission types for fine-grained access control
 * Format: 'resource:action' (e.g., 'property:write', 'booking:read')
 */
export type Permission = string;

/**
 * JWT payload interface - Enterprise security standard
 * Matches backend JWT generation exactly
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  deviceId?: string;
  sessionId?: string;
  exp: number;
  iat: number;
}

// =============================================================================
// AUTHENTICATION REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request interface
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'guest' | 'owner';
}

/**
 * Token information structure
 * Used for both storage and transmission
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry?: number;
  refreshTokenExpiry?: number;
}

/**
 * Comprehensive authentication response
 * Handles both backend nested format AND frontend flat format
 * This is the UNIFIED interface that works with DataTransformer
 */
export interface AuthResponse {
  // Core response data (always present)
  user: User;
  message?: string;
  sessionId?: string;
  
  // Token data - supports BOTH formats for backward compatibility
  token?: string;              // Frontend format (flat)
  refreshToken?: string;       // Frontend format (flat)
  tokenExpiry?: number;        // Frontend format
  refreshTokenExpiry?: number; // Frontend format
  
  // Backend nested format (will be transformed by DataTransformer)
  tokens?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  };
  
  // Additional metadata
  success?: boolean;
  error?: string;
}

/**
 * Token refresh response
 */
export interface RefreshResponse {
  token: string;
  refreshToken?: string;
  tokenExpiry?: number;
  refreshTokenExpiry?: number;
  sessionId?: string;
}

// =============================================================================
// PASSWORD MANAGEMENT TYPES
// =============================================================================

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

// =============================================================================
// PROFILE MANAGEMENT TYPES  
// =============================================================================

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * Profile verification request
 */
export interface VerifyEmailRequest {
  token: string;
}

// =============================================================================
// AUTHENTICATION STATE MANAGEMENT
// =============================================================================

/**
 * Authentication state interface - Enterprise patterns
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  error: string | null;
  lastActivity: number | null;
  sessionId: string | null;
}

/**
 * Authentication context value interface
 * Complete API for authentication operations
 */
export interface AuthContextValue {
  // State
  state: AuthState;
  
  // Core authentication operations
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Profile management
  getProfile: () => Promise<User>;
  updateProfile: (data: UpdateProfileRequest) => Promise<User>;
  
  // Password management
  requestPasswordReset: (request: ForgotPasswordRequest) => Promise<{ message: string }>;
  resetPassword: (request: ResetPasswordRequest) => Promise<{ message: string }>;
  changePassword: (request: ChangePasswordRequest) => Promise<{ message: string }>;
  
  // Email verification
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendEmailVerification: () => Promise<{ message: string }>;
  
  // Utility methods
  checkPermission: (requiredRole: UserRole) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAuthenticated: () => boolean;
  needsTokenRefresh: () => boolean;
  clearAuth: () => void;
}

// =============================================================================
// ROUTE PROTECTION & SECURITY
// =============================================================================

/**
 * Route protection configuration
 */
export interface RouteProtection {
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  redirectTo?: string;
  allowUnauthenticated?: boolean;
}

/**
 * Server-side authentication validation result
 */
export interface ServerAuthValidation {
  isValid: boolean;
  payload: JWTPayload | null;
  user: User | null;
  error?: string;
  errorCode?: string;
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * User session information
 */
export interface UserSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
}

/**
 * Device information for session tracking
 */
export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  platform?: string;
  browser?: string;
  isMobile?: boolean;
  isBot?: boolean;
}

// =============================================================================
// ERROR HANDLING & MONITORING
// =============================================================================

/**
 * Authentication error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_FAILED = 'REFRESH_FAILED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  DEVICE_MISMATCH = 'DEVICE_MISMATCH',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Structured authentication error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp?: string;
  requestId?: string;
}

// =============================================================================
// MONITORING & METRICS
// =============================================================================

/**
 * Authentication event for monitoring
 */
export interface AuthEvent {
  eventType: 'login' | 'register' | 'logout' | 'refresh' | 'password_change';
  userId: string;
  sessionId?: string;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  errorType?: AuthErrorType;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Performance metrics for authentication operations
 */
export interface AuthPerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// ENTERPRISE CONFIGURATION
// =============================================================================

/**
 * Authentication configuration
 */
export interface AuthConfig {
  // Token settings
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
  tokenRefreshThreshold: number;
  
  // Security settings
  requireEmailVerification: boolean;
  enableMFA: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  maxConcurrentSessions: number;
  
  // Rate limiting
  maxLoginAttempts: number;
  lockoutDuration: number;
  
  // Monitoring
  enableAnalytics: boolean;
  enableAuditLogging: boolean;
}

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventReuse: boolean;
  maxAge?: number;
}

// =============================================================================
// BACKWARD COMPATIBILITY
// =============================================================================

/**
 * Legacy AuthResponse interface for backward compatibility
 * @deprecated Use AuthResponse instead
 */
export interface LegacyAuthResponse {
  success: boolean;
  token?: string;
  user?: JWTPayload;
  message?: string;
  error?: string;
}

// =============================================================================
// TYPE GUARDS & UTILITIES
// =============================================================================

/**
 * Type guard to check if response has nested tokens format
 */
export function hasNestedTokens(response: any): response is AuthResponse & { tokens: TokenData } {
  return response && typeof response === 'object' && response.tokens && typeof response.tokens === 'object';
}

/**
 * Type guard to check if response has flat tokens format
 */
export function hasFlatTokens(response: any): response is AuthResponse & { token: string } {
  return response && typeof response === 'object' && typeof response.token === 'string';
}

/**
 * Type guard to check if user has required role
 */
export function hasRequiredRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    guest: 1,
    owner: 2,
    staff: 3,
    admin: 4
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Utility to extract user ID from various sources
 */
export function extractUserId(source: User | JWTPayload | string): string {
  if (typeof source === 'string') return source;
  if ('id' in source) return source.id;
  if ('userId' in source) return source.userId;
  throw new Error('Cannot extract user ID from source');
}

// =============================================================================
// EXPORT COLLECTIONS FOR CONVENIENCE
// =============================================================================

/**
 * All request types
 */
export type AuthRequestTypes = 
  | LoginRequest 
  | RegisterRequest 
  | ForgotPasswordRequest 
  | ResetPasswordRequest 
  | ChangePasswordRequest 
  | UpdateProfileRequest 
  | VerifyEmailRequest;

/**
 * All response types
 */
export type AuthResponseTypes = 
  | AuthResponse 
  | RefreshResponse 
  | { message: string };

/**
 * All error types
 */
export type AuthErrorTypes = AuthError | AuthErrorType;

/**
 * All state types
 */
export type AuthStateTypes = AuthState | AuthContextValue;

/**
 * All configuration types
 */
export type AuthConfigTypes = AuthConfig | PasswordPolicy | RouteProtection;