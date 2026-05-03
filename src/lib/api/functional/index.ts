/**
 * Functional API - Main Export
 *
 * Clean exports for all functional programming utilities and API clients.
 */

// Core monads - use namespaced exports to avoid conflicts
export * as Result from './result';
export * as Option from './option';
export * as Either from './either';

// Function composition
export * from './compose';

// Validators
export * from './validators';

// API client
export * from './apiClient';
