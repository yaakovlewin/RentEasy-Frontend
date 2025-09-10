/**
 * @fileoverview Authentication Type Definitions
 * 
 * Shared type definitions for authentication across the application.
 * Ensures type safety for JWT payloads, user roles, and auth states.
 */

/**
 * JWT payload interface for type safety
 * Matches the structure defined in middleware.ts
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'guest' | 'owner' | 'staff' | 'admin';
  exp: number;
  iat: number;
}

/**
 * User role types for role-based access control
 */
export type UserRole = 'guest' | 'owner' | 'staff' | 'admin';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: JWTPayload | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register credentials interface
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

/**
 * Auth response interface
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: JWTPayload;
  message?: string;
  error?: string;
}

/**
 * Server-side auth validation result
 */
export interface ServerAuthValidation {
  isValid: boolean;
  payload: JWTPayload | null;
  error?: string;
}

/**
 * Route protection configuration
 */
export interface RouteProtection {
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Auth context value interface
 */
export interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkPermission: (requiredRole: UserRole) => boolean;
}