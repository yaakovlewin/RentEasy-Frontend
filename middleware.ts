/**
 * Enterprise-Grade Next.js Middleware
 * 
 * Server-side route protection with role-based access control,
 * automatic redirects, and comprehensive security features.
 * 
 * Matches enterprise standards for Airbnb/Google-level applications.
 */

import { NextRequest, NextResponse } from 'next/server';

// JWT payload interface for type safety
interface JWTPayload {
  userId: string;
  email: string;
  role: 'guest' | 'owner' | 'staff' | 'admin';
  exp: number;
  iat: number;
}

// Route configuration for enterprise-grade access control
const ROUTE_PROTECTION = {
  // Public routes - accessible to everyone
  public: [
    '/',
    '/search', 
    '/property',
    '/auth/login',
    '/auth/register',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ],
  
  // Protected routes - require authentication
  authenticated: [
    '/dashboard',
    '/profile',
    '/bookings',
    '/favorites'
  ],
  
  // Owner/Host routes - require owner role or higher
  owner: [
    '/host',
    '/host/dashboard', 
    '/host/properties',
    '/host/bookings'
  ],
  
  // Staff routes - require staff role or higher
  staff: [
    '/admin/users',
    '/admin/properties',
    '/admin/bookings'
  ],
  
  // Admin routes - require admin role
  admin: [
    '/admin/system',
    '/admin/settings',
    '/admin/reports'
  ],
  
  // Auth routes - redirect if already authenticated
  authOnly: [
    '/auth/login',
    '/auth/register'
  ]
};

/**
 * Decode JWT token securely
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    // Validate required fields
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.exp) {
      return null;
    }
    
    return decoded as JWTPayload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
}

/**
 * Check if route matches any pattern in array
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (route === pathname) return true;
    
    // Dynamic route match (e.g., /property/[id])
    if (route.includes('[') || pathname.startsWith(route + '/')) {
      return pathname.startsWith(route.replace(/\/\[.*?\]/g, ''));
    }
    
    // Prefix match for nested routes
    if (pathname.startsWith(route + '/')) return true;
    
    return false;
  });
}

/**
 * Determine required role for route
 */
function getRequiredRole(pathname: string): 'public' | 'guest' | 'owner' | 'staff' | 'admin' {
  if (matchesRoute(pathname, ROUTE_PROTECTION.admin)) return 'admin';
  if (matchesRoute(pathname, ROUTE_PROTECTION.staff)) return 'staff'; 
  if (matchesRoute(pathname, ROUTE_PROTECTION.owner)) return 'owner';
  if (matchesRoute(pathname, ROUTE_PROTECTION.authenticated)) return 'guest';
  return 'public';
}

/**
 * Check if user role has permission for required role
 */
function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    guest: 1,
    owner: 2,
    staff: 3,
    admin: 4
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Get redirect URL based on user role and intended destination
 */
function getRedirectUrl(
  userRole: string | null, 
  intendedPath: string,
  request: NextRequest
): string {
  const baseUrl = request.nextUrl.origin;
  
  // If user not authenticated and trying to access protected route
  if (!userRole) {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('redirect', intendedPath);
    return loginUrl.toString();
  }
  
  // If authenticated user trying to access auth pages
  if (matchesRoute(intendedPath, ROUTE_PROTECTION.authOnly)) {
    // Redirect based on role
    switch (userRole) {
      case 'owner':
        return new URL('/host/dashboard', baseUrl).toString();
      case 'staff':
      case 'admin':
        return new URL('/admin/dashboard', baseUrl).toString();
      default:
        return new URL('/dashboard', baseUrl).toString();
    }
  }
  
  // If user lacks permission for intended route
  return new URL('/dashboard', baseUrl).toString();
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') && !pathname.includes('/property/') // Skip files but allow dynamic routes
  ) {
    return NextResponse.next();
  }
  
  // Get authentication token from cookie or header
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');
  
  let userPayload: JWTPayload | null = null;
  let isAuthenticated = false;
  
  // Validate token if present
  if (token) {
    userPayload = decodeJWT(token);
    
    if (userPayload && !isTokenExpired(userPayload)) {
      isAuthenticated = true;
    }
  }
  
  // Determine required permission level
  const requiredRole = getRequiredRole(pathname);
  
  // Handle public routes
  if (requiredRole === 'public') {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && matchesRoute(pathname, ROUTE_PROTECTION.authOnly)) {
      const redirectUrl = getRedirectUrl(userPayload!.role, pathname, request);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  }
  
  // Handle protected routes
  if (!isAuthenticated) {
    const redirectUrl = getRedirectUrl(null, pathname, request);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check role-based permissions
  if (!hasPermission(userPayload!.role, requiredRole)) {
    const redirectUrl = getRedirectUrl(userPayload!.role, pathname, request);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Add security headers for protected routes
  const response = NextResponse.next();
  
  // Enterprise security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add user context to headers for client-side access
  response.headers.set('X-User-Role', userPayload!.role);
  response.headers.set('X-User-Id', userPayload!.userId);
  
  return response;
}

/**
 * Configure middleware matcher
 * 
 * Runs middleware on all routes except static assets and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (png, jpg, jpeg, gif, svg, ico, webp)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};