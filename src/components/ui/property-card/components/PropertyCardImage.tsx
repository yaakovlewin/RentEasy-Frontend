import React, { useState, useCallback } from 'react';

import Image from 'next/image';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { PropertyCardImageProps } from '../types';

export function PropertyCardImage({
  property,
  variant,
  size,
  aspectRatio = 1.5,
  enableCarousel = true,
  onImageClick,
  className,
}: PropertyCardImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const images = property.images || [];
  const hasMultipleImages = images.length > 1 && enableCarousel;
  
  // Fallback image for when no images are available
  const fallbackImage = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop';
  const currentImage = images[currentImageIndex] || fallbackImage;

  // Navigation handlers
  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMultipleImages) return;
    
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [hasMultipleImages, images.length]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMultipleImages) return;
    
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [hasMultipleImages, images.length]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageClick?.();
  }, [onImageClick]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Get appropriate sizing based on variant and size
  const getImageDimensions = () => {
    const baseDimensions = {
      compact: { width: 300, height: 200 },
      list: { width: 150, height: 100 },
      default: { width: 400, height: Math.round(400 / aspectRatio) },
    };

    const dimensions = baseDimensions[variant as keyof typeof baseDimensions] || baseDimensions.default;
    
    // Adjust for size
    const sizeMultiplier = {
      sm: 0.8,
      md: 1,
      lg: 1.2,
      xl: 1.4,
    };
    
    const multiplier = sizeMultiplier[size] || 1;
    
    return {
      width: Math.round(dimensions.width * multiplier),
      height: Math.round(dimensions.height * multiplier),
    };
  };

  const { width, height } = getImageDimensions();

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-gray-100 group',
        variant === 'list' ? 'rounded-lg' : 'rounded-t-lg',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Main image */}
      <Image
        src={imageError ? fallbackImage : currentImage}
        alt={property.title}
        fill
        className={cn(
          'object-cover transition-transform duration-200',
          'group-hover:scale-105',
          imageLoading && 'opacity-0'
        )}
        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={handleImageClick}
        priority={variant === 'featured'}
      />

      {/* Loading state */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Image navigation (carousel) */}
      {hasMultipleImages && (
        <>
          {/* Previous button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'bg-black/20 hover:bg-black/40 text-white',
              'w-8 h-8 p-0 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
            )}
            onClick={handlePrevImage}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Next button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'bg-black/20 hover:bg-black/40 text-white',
              'w-8 h-8 p-0 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
            )}
            onClick={handleNextImage}
            disabled={images.length <= 1}
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Image indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors duration-200',
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Click overlay for better accessibility */}
      {onImageClick && (
        <button
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={handleImageClick}
          aria-label={`View details for ${property.title}`}
        />
      )}
    </div>
  );
}