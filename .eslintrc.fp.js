/**
 * ESLint Configuration for Functional Programming
 *
 * This extends the base ESLint configuration with FP-specific rules
 * to enforce immutability, pure functions, and functional patterns.
 *
 * Usage:
 *   eslint --config .eslintrc.fp.js src/lib/api/functional/
 *
 * Note: Install eslint-plugin-fp and eslint-plugin-functional first:
 *   npm install --save-dev eslint-plugin-fp eslint-plugin-functional
 */

module.exports = {
  extends: [
    './eslint.config.mjs', // Base Next.js config
  ],

  // Note: These plugins need to be installed
  // plugins: ['fp', 'functional'],

  rules: {
    // Immutability Rules
    'no-param-reassign': ['error', { props: true }],
    'prefer-const': 'error',
    'no-var': 'error',

    // Function Purity
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-alert': 'error',

    // Avoid Mutations
    'no-plusplus': ['error', { allowForLoopAfterthoughts: false }],

    // TypeScript Strict Rules (when using TypeScript)
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Functional Programming Best Practices
    'no-this-alias': 'error',
    'no-new-object': 'error',
    'no-array-constructor': 'error',

    // Arrow Functions
    'arrow-body-style': ['warn', 'as-needed'],
    'prefer-arrow-callback': 'warn',

    // Destructuring
    'prefer-destructuring': ['warn', {
      array: true,
      object: true,
    }],

    // Template Literals
    'prefer-template': 'warn',

    // Spread Operator
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',

    // Complexity
    'complexity': ['warn', 10],
    'max-depth': ['warn', 3],
    'max-lines-per-function': ['warn', {
      max: 50,
      skipBlankLines: true,
      skipComments: true
    }],
  },

  // FP-specific overrides for functional code
  overrides: [
    {
      files: ['**/functional/**/*.ts', '**/functional/**/*.tsx'],
      rules: {
        // Stricter rules for functional code
        'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: [] }],
        'prefer-const': 'error',
        'no-let': 'off', // This would require the FP plugin
        'complexity': ['error', 8],
        'max-depth': ['error', 2],

        // Uncomment when eslint-plugin-fp is installed:
        // 'fp/no-mutation': 'error',
        // 'fp/no-let': 'warn',
        // 'fp/no-class': 'error',
        // 'fp/no-this': 'error',
        // 'fp/no-loops': 'warn',
        // 'fp/no-mutating-methods': 'error',

        // Uncomment when eslint-plugin-functional is installed:
        // 'functional/immutable-data': 'error',
        // 'functional/no-let': 'warn',
        // 'functional/prefer-readonly-type': 'warn',
        // 'functional/no-method-signature': 'warn',
      },
    },
    {
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        // Relax some rules for tests
        'max-lines-per-function': 'off',
        'no-console': 'off',
      },
    },
  ],
};
