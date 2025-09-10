/**
 * @deprecated This file is deprecated. Import from @/lib/utils/* instead.
 * This file now re-exports from the new organized utility structure for backward compatibility.
 */

// Re-export everything from the new structure for backward compatibility
export {
  // Styling
  cn,

  // Formatting
  formatDate,
  formatCurrency,
  capitalizeFirst,
  truncateText,
  generateSlug,

  // Additional exports for convenience
  formatDateRange,
  formatRelativeTime,
  formatTimeAgo,
  calculateNights,
  formatPriceRange,
  formatNumber,
  formatPercentage,
  capitalizeWords,
  formatFileSize,
  pluralize,
  DATE_FORMATS,

  // Type exports
  type ClassValue,
} from './utils/index';
