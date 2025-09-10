/**
 * Structured Data Component - RentEasy
 * 
 * Reusable component for injecting JSON-LD structured data into pages.
 * Supports all major Schema.org types with validation and optimization.
 * 
 * Features:
 * - Type-safe structured data rendering
 * - Automatic sanitization and validation
 * - Development mode warnings
 * - Performance optimized
 * - Support for multiple schemas per page
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { StructuredData } from '@/lib/types/seo';
import { validateStructuredData, sanitizeStructuredData, generateJSONLD } from '@/lib/seo/structured-data';

interface StructuredDataProps {
  data: StructuredData | StructuredData[];
  validate?: boolean;
  sanitize?: boolean;
  onValidationError?: (errors: string[], warnings: string[]) => void;
}

/**
 * Structured Data Component for JSON-LD injection
 */
export const StructuredDataComponent: React.FC<StructuredDataProps> = ({
  data,
  validate = process.env.NODE_ENV === 'development',
  sanitize = true,
  onValidationError,
}) => {
  const [processedData, setProcessedData] = useState<StructuredData | StructuredData[]>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    let processed = data;

    // Sanitization
    if (sanitize) {
      processed = sanitizeStructuredData(data);
    }

    // Validation
    if (validate) {
      const schemas = Array.isArray(processed) ? processed : [processed];
      const allErrors: string[] = [];
      const allWarnings: string[] = [];

      schemas.forEach((schema, index) => {
        const validation = validateStructuredData(schema);
        if (!validation.isValid) {
          allErrors.push(...validation.errors.map(err => `Schema ${index + 1}: ${err}`));
        }
        allWarnings.push(...validation.warnings.map(warn => `Schema ${index + 1}: ${warn}`));
      });

      setValidationErrors(allErrors);
      setValidationWarnings(allWarnings);

      if (allErrors.length > 0 || allWarnings.length > 0) {
        onValidationError?.(allErrors, allWarnings);
        
        // Console warnings in development
        if (process.env.NODE_ENV === 'development') {
          if (allErrors.length > 0) {
            console.error('Structured Data Validation Errors:', allErrors);
          }
          if (allWarnings.length > 0) {
            console.warn('Structured Data Validation Warnings:', allWarnings);
          }
        }
      }
    }

    setProcessedData(processed);
  }, [data, validate, sanitize, onValidationError]);

  // Don't render if there are critical validation errors
  if (validate && validationErrors.length > 0 && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!processedData) {
    return null;
  }

  const jsonLd = generateJSONLD(processedData);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* Development mode validation display */}
      {process.env.NODE_ENV === 'development' && validate && (
        <div style={{ display: 'none' }} data-testid="structured-data-validation">
          {validationErrors.length > 0 && (
            <div data-validation="errors">
              {validationErrors.join('; ')}
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div data-validation="warnings">
              {validationWarnings.join('; ')}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Convenience components for specific schema types
export const OrganizationSchema: React.FC<{ 
  organizationData: StructuredData; 
  validate?: boolean;
}> = ({ organizationData, validate }) => (
  <StructuredDataComponent 
    data={organizationData} 
    validate={validate}
  />
);

export const WebsiteSchema: React.FC<{ 
  websiteData: StructuredData; 
  validate?: boolean;
}> = ({ websiteData, validate }) => (
  <StructuredDataComponent 
    data={websiteData} 
    validate={validate}
  />
);

export const LocalBusinessSchema: React.FC<{ 
  businessData: StructuredData; 
  validate?: boolean;
}> = ({ businessData, validate }) => (
  <StructuredDataComponent 
    data={businessData} 
    validate={validate}
  />
);

export const PropertySchema: React.FC<{ 
  propertyData: StructuredData; 
  validate?: boolean;
}> = ({ propertyData, validate }) => (
  <StructuredDataComponent 
    data={propertyData} 
    validate={validate}
  />
);

export default StructuredDataComponent;
// Named exports for different import patterns
export { StructuredDataComponent as StructuredData };
