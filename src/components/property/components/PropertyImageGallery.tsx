'use client';

/**
 * @fileoverview PropertyImageGallery Component
 * 
 * Enterprise-grade image gallery component extracted from monolithic PropertyDetailsPage.
 * Features keyboard navigation, touch gestures, accessibility support, and performance optimization.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageGallery } from '../hooks';

interface PropertyImageGalleryProps {
  /** Array of image URLs for the property */
  images: string[];
  /** Property title for alt text */
  title: string;
  /** Optional CSS classes */
  className?: string;
  /** Gallery height - defaults to responsive height */
  height?: string;
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  /** Enable touch gestures */
  enableTouchGestures?: boolean;
  /** Image loading priority */
  priority?: boolean;
}

/**
 * PropertyImageGallery - Extracted image gallery component
 * 
 * Features:
 * - Touch gesture navigation with swipe support
 * - Keyboard navigation (arrow keys, home, end)
 * - Accessibility support with ARIA labels
 * - Performance optimized with Next.js Image
 * - Responsive design with proper sizing
 */
export const PropertyImageGallery = memo(function PropertyImageGallery({
  images,
  title,
  className,
  height = 'h-96 lg:h-[500px]',
  enableKeyboardNavigation = true,
  enableTouchGestures = true,
  priority = true,
}: PropertyImageGalleryProps) {
  const {
    currentIndex,
    nextImage,
    prevImage,
    goToImage,
    canGoNext,
    canGoPrev,
    getImageAltText,
    getAriaLabel,
    handleKeyDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useImageGallery(images, {
    enableKeyboardNavigation,
    enableTouchGestures,
  });

  // Don't render if no images
  if (!images || images.length === 0) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center', height, className)}>
        <div className="text-center text-gray-500">
          <Image
            src="/placeholder-property.jpg"
            alt="Property placeholder"
            width={400}
            height={300}
            className="opacity-50"
          />
          <p className="mt-2">No images available</p>
        </div>
      </div>
    );
  }

  // Single image - no navigation needed
  if (images.length === 1) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden', className)}>
        <div className={cn('relative', height)}>
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      <div 
        className={cn('relative', height)}
        role="img"
        aria-label={getAriaLabel()}
        onKeyDown={enableKeyboardNavigation ? (e) => handleKeyDown(e.nativeEvent) : undefined}
        onTouchStart={enableTouchGestures ? (e) => handleTouchStart(e.nativeEvent) : undefined}
        onTouchMove={enableTouchGestures ? (e) => handleTouchMove(e.nativeEvent) : undefined}
        onTouchEnd={enableTouchGestures ? (e) => handleTouchEnd(e.nativeEvent) : undefined}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
      >
        {/* Current Image */}
        <Image
          src={images[currentIndex]}
          alt={getImageAltText(currentIndex)}
          fill
          className="object-cover transition-opacity duration-300"
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 80vw"
          onError={(e) => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-property.jpg';
          }}
        />

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              disabled={!canGoPrev}
              className={cn(
                'absolute left-4 top-1/2 transform -translate-y-1/2',
                'bg-white/80 backdrop-blur-sm rounded-full p-2',
                'hover:bg-white transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'z-10'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              disabled={!canGoNext}
              className={cn(
                'absolute right-4 top-1/2 transform -translate-y-1/2',
                'bg-white/80 backdrop-blur-sm rounded-full p-2',
                'hover:bg-white transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'z-10'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-white/50',
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`Go to image ${index + 1} of ${images.length}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Keyboard Navigation Instructions (Screen Reader Only) */}
      {enableKeyboardNavigation && (
        <div className="sr-only">
          Use arrow keys to navigate images, Home and End keys to jump to first and last image.
          Press Escape to exit fullscreen if in fullscreen mode.
        </div>
      )}
    </div>
  );
});

PropertyImageGallery.displayName = 'PropertyImageGallery';

export default PropertyImageGallery;