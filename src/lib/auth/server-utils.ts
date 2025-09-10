/**
 * @fileoverview Server-Side Authentication Utilities
 * 
 * Server-only utilities for JWT handling and authentication validation.
 * Used in server components and middleware for auth operations.
 */

import { JWTPayload } from '@/types/auth';

/**
 * Decode JWT token on server side
 * Server-safe JWT decoding without browser dependencies
 */
export function decodeServerJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    
    // Server-side base64url decoding (standard JWT format)
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );
    
    // Validate required fields
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.exp) {
      return null;
    }

    // Validate role is valid
    const validRoles = ['guest', 'owner', 'staff', 'admin'];
    if (!validRoles.includes(decoded.role)) {
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    console.error('Server JWT decode error:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired (server-side)
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
}

/**
 * Validate token and return user info (server-side)
 */
export function validateServerToken(token: string | null): {
  isValid: boolean;
  payload: JWTPayload | null;
  error?: string;
} {
  if (!token) {
    return {
      isValid: false,
      payload: null,
      error: 'No token provided',
    };
  }

  const payload = decodeServerJWT(token);
  
  if (!payload) {
    return {
      isValid: false,
      payload: null,
      error: 'Invalid token format',
    };
  }

  if (isTokenExpired(payload)) {
    return {
      isValid: false,
      payload: null,
      error: 'Token expired',
    };
  }

  return {
    isValid: true,
    payload,
  };
}

/**
 * Get redirect URL based on user role (server-side)
 */
export function getServerRedirectUrl(role: string): string {
  switch (role) {
    case 'owner':
      return '/host/dashboard';
    case 'staff':
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user has required permission level (server-side)
 */
export function hasServerPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    guest: 1,
    owner: 2,
    staff: 3,
    admin: 4,
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}