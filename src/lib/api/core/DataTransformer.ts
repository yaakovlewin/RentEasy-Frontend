/**
 * DataTransformer - Modern enterprise data transformation
 * 
 * Clean, type-safe data transformation between frontend camelCase and backend snake_case.
 * Handles all common transformation patterns with proper TypeScript support.
 */

/**
 * Transform object keys from camelCase to snake_case (for backend requests)
 * Uses the exact logic from legacy API that's proven to work
 */
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      transformed[snakeKey] = toSnakeCase(value);
    }
    
    return transformed;
  }
  
  return obj;
}

/**
 * Transform object keys from snake_case to camelCase (for frontend consumption)
 * Uses the exact logic from legacy API that's proven to work
 */
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = toCamelCase(value);
    }
    
    return transformed;
  }
  
  return obj;
}

class DataTransformer {
  /**
   * Transform frontend data to backend format (camelCase → snake_case)
   */
  toBackendFormat(data: any): any {
    if (!data) return data;
    
    // Handle special cases from legacy API
    if (data.firstName !== undefined || data.lastName !== undefined || data.phoneNumber !== undefined) {
      return {
        ...toSnakeCase(data),
        // Ensure these critical fields are handled correctly
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
      };
    }
    
    return toSnakeCase(data);
  }

  /**
   * Transform backend response to frontend format (snake_case → camelCase)
   */
  toFrontendFormat(data: any): any {
    if (!data) return data;
    
    const transformed = toCamelCase(data);
    
    // Handle special auth response transformation (legacy compatible)
    if (transformed.user) {
      transformed.user = {
        ...transformed.user,
        // Ensure these fields are properly transformed
        firstName: transformed.user.firstName || transformed.user.first_name,
        lastName: transformed.user.lastName || transformed.user.last_name,
        phoneNumber: transformed.user.phoneNumber || transformed.user.phone_number,
      };
      
      // Clean up any remaining snake_case fields
      delete transformed.user.first_name;
      delete transformed.user.last_name;
      delete transformed.user.phone_number;
    }
    
    return transformed;
  }

  /**
   * Transform registration request data
   */
  transformRegistrationRequest(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: 'guest' | 'owner';
  }): any {
    return {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      role: userData.role,
    };
  }

  /**
   * Transform authentication response data - ENTERPRISE GRADE
   * 
   * Handles both backend nested tokens structure: { tokens: { accessToken, refreshToken } }
   * AND converts to frontend expected flat structure: { token, refreshToken }
   * 
   * This is the CRITICAL FIX for the backend-frontend response format mismatch.
   * 
   * Backend format: { user, tokens: { accessToken, refreshToken, ...expiry }, sessionId, message }
   * Frontend format: { token, refreshToken, user, sessionId, ...expiry, message }
   * 
   * @param response - Raw backend authentication response
   * @returns Normalized frontend-compatible response
   */
  transformAuthResponse(response: any): any {
    if (!response) return response;
    
    // Start with a clean transformed object
    const transformed: any = {};
    
    // PHASE 1: Handle nested tokens structure from backend (CRITICAL FIX)
    if (response.tokens && typeof response.tokens === 'object') {
      // Backend sends: { tokens: { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } }
      // Frontend expects: { token, refreshToken, tokenExpiry, refreshTokenExpiry }
      transformed.token = response.tokens.accessToken;
      transformed.refreshToken = response.tokens.refreshToken;
      
      // Preserve expiry information for frontend token management
      if (response.tokens.accessTokenExpiry) {
        transformed.tokenExpiry = response.tokens.accessTokenExpiry;
      }
      if (response.tokens.refreshTokenExpiry) {
        transformed.refreshTokenExpiry = response.tokens.refreshTokenExpiry;
      }
    } else if (response.token) {
      // Already in flat format (backward compatibility)
      transformed.token = response.token;
      if (response.refreshToken) transformed.refreshToken = response.refreshToken;
      if (response.tokenExpiry) transformed.tokenExpiry = response.tokenExpiry;
      if (response.refreshTokenExpiry) transformed.refreshTokenExpiry = response.refreshTokenExpiry;
    }
    
    // PHASE 2: Transform user data with comprehensive field mapping
    if (response.user) {
      transformed.user = {
        id: response.user.id,
        firstName: response.user.firstName || response.user.first_name,
        lastName: response.user.lastName || response.user.last_name,
        email: response.user.email,
        role: response.user.role,
        phoneNumber: response.user.phoneNumber || response.user.phone_number,
        isVerified: response.user.isVerified ?? response.user.is_verified ?? false,
        isActive: response.user.isActive ?? response.user.is_active ?? true,
        lastLoginAt: response.user.lastLoginAt || response.user.last_login_at,
        createdAt: response.user.createdAt || response.user.created_at,
        updatedAt: response.user.updatedAt || response.user.updated_at,
      };
    }
    
    // PHASE 3: Preserve additional metadata
    if (response.sessionId) {
      transformed.sessionId = response.sessionId;
    }
    
    if (response.message) {
      transformed.message = response.message;
    }
    
    if (response.success !== undefined) {
      transformed.success = response.success;
    }
    
    if (response.error) {
      transformed.error = response.error;
    }
    
    // PHASE 4: Enterprise validation and logging
    if (process.env.NODE_ENV === 'development') {
      // Validate transformation results in development
      if (response.tokens && !transformed.token) {
        console.warn('DataTransformer: Failed to transform nested tokens structure', response);
      }
      
      if (response.user && !transformed.user?.id) {
        console.warn('DataTransformer: Failed to transform user data', response);
      }
    }
    
    return transformed;
  }

  /**
   * Transform booking request data
   */
  transformBookingRequest(bookingData: {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
  }): any {
    return {
      propertyId: bookingData.propertyId,
      checkIn: bookingData.checkInDate,
      checkOut: bookingData.checkOutDate,
      guests: bookingData.numberOfGuests,
    };
  }

  /**
   * Transform file upload to FormData
   */
  transformFileUpload(file: File, fieldName: string = 'file'): FormData {
    const formData = new FormData();
    formData.append(fieldName, file);
    return formData;
  }

  /**
   * Clean search parameters by removing empty values
   */
  cleanSearchParams(params: Record<string, any>): Record<string, any> {
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanParams[key] = value;
      }
    });
    
    return cleanParams;
  }

  /**
   * Transform property data for API requests
   */
  transformPropertyData(propertyData: any): any {
    return this.toBackendFormat(propertyData);
  }

  /**
   * Transform user profile update data
   */
  transformUserProfileData(userData: any): any {
    return this.toBackendFormat(userData);
  }

  /**
   * Safe JSON parse with fallback
   */
  safeJsonParse(jsonString: string, fallback: any = null): any {
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  }

  /**
   * Safe JSON stringify
   */
  safeJsonStringify(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return '{}';
    }
  }

  /**
   * Validate and sanitize email
   */
  sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Transform error response to consistent format
   */
  transformErrorResponse(error: any): {
    message: string;
    code?: string;
    details?: any;
  } {
    if (error?.response?.data) {
      const data = error.response.data;
      return {
        message: data.message || 'An error occurred',
        code: data.code || data.error,
        details: data.details || data.validationErrors,
      };
    }
    
    return {
      message: error?.message || 'An unexpected error occurred',
    };
  }
}

// Singleton instance for global use
export const dataTransformer = new DataTransformer();

export { DataTransformer };
export default dataTransformer;