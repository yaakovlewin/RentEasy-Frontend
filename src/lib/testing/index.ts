/**
 * FP Testing Infrastructure
 *
 * Centralized exports for all FP testing utilities
 */

export * from './fpTestUtils';
export * from './mockData';
export * from './resultMatchers';

export {
  testPureFunction,
  testPureFunctionMulti,
  expectOk,
  expectErr,
  testReferentialTransparency,
  testNoSideEffects,
  testCompositionLaw,
  testFunctorIdentityLaw,
  testFunctorCompositionLaw,
  testMonadLeftIdentity,
  testMonadRightIdentity,
  testMonadAssociativity,
  propertyTest,
  createFunctionSpy,
  immutabilityHelpers,
} from './fpTestUtils';

export {
  mockData,
  generateSearchParams,
  generateProperty,
  generateProperties,
  generateUser,
  generateBooking,
  generateOk,
  generateErr,
  generateResult,
  generateApiError,
  generateValidationError,
  generateArray,
  generateString,
  generateEmail,
  generateNumber,
  generateBoolean,
  resetSeed,
} from './mockData';

export {
  registerResultMatchers,
  resultMatchers,
  matcherUtils,
} from './resultMatchers';
