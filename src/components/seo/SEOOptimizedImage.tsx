/**
 * SEO-Optimized Image Component - RentEasy
 * 
 * Advanced image component with comprehensive SEO optimizations including
 * intelligent alt text generation, performance optimizations, and accessibility features.
 * 
 * Features:
 * - Automatic alt text enhancement based on context
 * - Progressive loading with SEO-friendly fallbacks
 * - Responsive image generation with optimal sizes
 * - Core Web Vitals optimization
 * - Structured data integration for image search
 * - Accessibility compliance (WCAG 2.1)
 * - Error handling and fallback systems
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { StructuredDataComponent } from './StructuredData';
import { 
  generateSEOImageConfig, 
  generateResponsiveSizes,
  type SEOOptimizedImageConfig 
} from '@/lib/seo/performance';
import { cn } from '@/lib/utils';

interface SEOOptimizedImageProps extends Omit<ImageProps, 'alt'> {
  // Required for SEO
  alt: string;
  
  // SEO Context
  context?: {
    propertyName?: string;
    location?: string;
    category?: string;
    isHero?: boolean;
    isAboveFold?: boolean;
    isThumbnail?: boolean;
    isGallery?: boolean;
    photographer?: string;
    license?: string;
    caption?: string;
  };

  // Enhanced SEO features
  enableStructuredData?: boolean;
  generateEnhancedAlt?: boolean;
  enablePerformanceOptimization?: boolean;
  enableAccessibility?: boolean;
  
  // Progressive enhancement
  enableProgressiveLoading?: boolean;
  showLoadingPlaceholder?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  
  // Performance
  customSizes?: string;
  responsiveBreakpoints?: Record<string, number>;
  
  // Event handlers
  onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onImageError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onInView?: () => void;
  
  // Wrapper props
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

/**
 * SEO-Optimized Image Component
 */
export const SEOOptimizedImage: React.FC<SEOOptimizedImageProps> = ({
  src,
  alt,
  context,
  enableStructuredData = true,
  generateEnhancedAlt = true,
  enablePerformanceOptimization = true,
  enableAccessibility = true,
  enableProgressiveLoading = true,
  showLoadingPlaceholder = true,
  loadingClassName,
  errorClassName,
  customSizes,
  responsiveBreakpoints,
  onImageLoad,
  onImageError,
  onInView,
  wrapperClassName,
  wrapperStyle,
  className,
  priority,
  loading,
  quality,
  placeholder,
  blurDataURL,
  sizes,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!enableProgressiveLoading);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Generate SEO configuration
  const seoConfig = generateSEOImageConfig(
    {
      src: src as string,
      alt,
      priority,
      loading,
      quality,
      placeholder,
      blurDataURL,
      sizes,
    },
    context
  );

  // Enhanced alt text generation
  const enhancedAlt = generateEnhancedAlt && context
    ? generateContextualAltText(alt, context)
    : alt;

  // Generate responsive sizes
  const responsiveSizes = customSizes || 
    (responsiveBreakpoints 
      ? generateResponsiveSizes({ 
          breakpoints: responsiveBreakpoints,
          maxWidth: props.width as number,
        })
      : seoConfig.sizes || sizes
    );

  // Performance optimization
  const optimizedProps = enablePerformanceOptimization
    ? {
        ...seoConfig,
        priority: context?.isAboveFold || context?.isHero || priority,
        loading: (context?.isAboveFold || context?.isHero) ? 'eager' as const : seoConfig.loading,
        sizes: responsiveSizes,
      }
    : {};

  // Intersection Observer for progressive loading
  useEffect(() => {
    if (!enableProgressiveLoading || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            onInView?.();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [enableProgressiveLoading, isInView, onInView]);

  // Handle image loading
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(false);
    onImageLoad?.(event);

    // Track performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationStart = performance.timing?.navigationStart;
      if (navigationStart) {
        const loadTime = Date.now() - navigationStart;
        
        // Send to analytics if available
        if ('gtag' in window) {
          (window as any).gtag('event', 'image_load', {
            event_category: 'performance',
            event_label: src,
            value: loadTime,
            custom_map: { metric1: 'image_load_time' },
          });
        }
      }
    }
  }, [onImageLoad, src]);

  // Handle image error
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    onImageError?.(event);

    // Log error for debugging
    console.warn('SEO Image Load Error:', {
      src,
      alt: enhancedAlt,
      context,
      error: event,
    });

    // Track errors in analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: `Image load error: ${src}`,
        fatal: false,
      });
    }
  }, [onImageError, src, enhancedAlt, context]);

  // Generate structured data for the image
  const imageStructuredData = enableStructuredData ? generateImageStructuredData({
    src: src as string,
    alt: enhancedAlt,
    context,
  }) : null;

  // Accessibility enhancements
  const accessibilityProps = enableAccessibility ? {
    role: context?.isHero ? 'img' : undefined,
    'aria-describedby': context?.caption ? `${props.id || 'img'}-caption` : undefined,
    tabIndex: context?.isHero ? 0 : -1,
  } : {};

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          'relative overflow-hidden',
          isLoading && 'animate-pulse bg-gray-200',
          hasError && 'bg-gray-100 border border-gray-300',
          wrapperClassName
        )}
        style={wrapperStyle}
        {...(enableAccessibility && { role: 'img', 'aria-label': enhancedAlt })}
      >
        {/* Loading Placeholder */}
        {isLoading && showLoadingPlaceholder && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gray-100',
              loadingClassName
            )}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center space-y-2 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Loading image...</span>
            </div>
          </div>
        )}

        {/* Error Placeholder */}
        {hasError && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gray-50',
              errorClassName
            )}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center space-y-2 text-gray-500">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-center">
                Failed to load image
                <br />
                <span className="text-xs">{enhancedAlt}</span>
              </span>
            </div>
          </div>
        )}

        {/* Main Image */}
        {(isInView || !enableProgressiveLoading) && !hasError && (
          <Image
            ref={imageRef}
            src={src}
            alt={enhancedAlt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              className
            )}
            {...optimizedProps}
            {...props}
            {...accessibilityProps}
          />
        )}

        {/* Caption */}
        {context?.caption && enableAccessibility && (
          <div
            id={`${props.id || 'img'}-caption`}
            className="sr-only"
          >
            {context.caption}
          </div>
        )}
      </div>

      {/* Structured Data */}
      {imageStructuredData && (
        <StructuredDataComponent data={imageStructuredData} />
      )}
    </>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate contextual alt text based on image context
 */
function generateContextualAltText(
  baseAlt: string,
  context: SEOOptimizedImageProps['context']
): string {
  if (!context) return baseAlt;

  let enhancedAlt = baseAlt;

  // Add property name if available and not already included
  if (context.propertyName && !enhancedAlt.toLowerCase().includes(context.propertyName.toLowerCase())) {
    enhancedAlt = `${enhancedAlt} at ${context.propertyName}`;
  }

  // Add location context
  if (context.location && !enhancedAlt.toLowerCase().includes(context.location.toLowerCase())) {
    enhancedAlt = `${enhancedAlt} in ${context.location}`;
  }

  // Add category context
  if (context.category && !enhancedAlt.toLowerCase().includes(context.category.toLowerCase())) {
    enhancedAlt = `${context.category} - ${enhancedAlt}`;
  }

  // Add descriptive context based on type
  if (context.isHero) {
    enhancedAlt = `Hero image: ${enhancedAlt}`;
  } else if (context.isThumbnail) {
    enhancedAlt = `Thumbnail: ${enhancedAlt}`;
  } else if (context.isGallery) {
    enhancedAlt = `Gallery image: ${enhancedAlt}`;
  }

  return enhancedAlt.trim();
}

/**
 * Generate structured data for image SEO
 */
function generateImageStructuredData(data: {
  src: string;
  alt: string;
  context?: SEOOptimizedImageProps['context'];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com';
  const imageUrl = data.src.startsWith('http') ? data.src : `${baseUrl}${data.src}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: imageUrl,
    contentUrl: imageUrl,
    name: data.alt,
    description: data.alt,
    ...(data.context?.caption && { caption: data.context.caption }),
    ...(data.context?.photographer && {
      author: {
        '@type': 'Person',
        name: data.context.photographer,
      },
    }),
    ...(data.context?.license && { license: data.context.license }),
    ...(data.context?.propertyName && {
      about: {
        '@type': 'Accommodation',
        name: data.context.propertyName,
      },
    }),
    isAccessibleForFree: true,
    acquireLicensePage: `${baseUrl}/terms`,
  };
}

/**
 * Hook for image performance monitoring
 */
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState<{
    loadTime?: number;
    size?: number;
    format?: string;
  }>({});

  const trackImageLoad = useCallback((imageElement: HTMLImageElement) => {
    if (!('performance' in window)) return;

    const src = imageElement.src;
    const startTime = performance.now();

    imageElement.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      
      // Try to get image size information
      const naturalWidth = imageElement.naturalWidth;
      const naturalHeight = imageElement.naturalHeight;
      const format = src.split('.').pop()?.toLowerCase();

      setMetrics({
        loadTime,
        size: naturalWidth * naturalHeight,
        format,
      });

      // Report to analytics if available
      if ('gtag' in window) {
        (window as any).gtag('event', 'timing_complete', {
          name: 'image_load',
          value: Math.round(loadTime),
          event_category: 'performance',
          event_label: format,
        });
      }
    }, { once: true });
  }, []);

  return { metrics, trackImageLoad };
};

export default SEOOptimizedImage;