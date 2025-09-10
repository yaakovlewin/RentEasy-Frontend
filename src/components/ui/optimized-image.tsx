'use client';

import * as React from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  lazy?: boolean;
  showSkeleton?: boolean;
  fallbackSrc?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  aspectRatio = '4/3',
  objectFit = 'cover',
  lazy = true,
  showSkeleton = true,
  fallbackSrc = '/placeholder-property.jpg',
  onLoadComplete,
  onError,
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [isInView, setIsInView] = React.useState(!lazy || priority);

  const imgRef = React.useRef<React.ElementRef<typeof Image>>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = React.useCallback(() => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
    onError?.();
  }, [hasError, fallbackSrc, currentSrc, onError]);

  // Generate blur data URL if not provided
  const getBlurDataURL = React.useMemo(() => {
    if (blurDataURL) return blurDataURL;

    // Simple SVG blur placeholder
    const svg = `
      <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, [blurDataURL]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', `aspect-[${aspectRatio}]`, className)}
      style={{ width, height }}
    >
      {/* Loading skeleton */}
      {isLoading && showSkeleton && (
        <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse'>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer' />
        </div>
      )}

      {/* Blur placeholder */}
      {isLoading && placeholder === 'blur' && (
        <div
          className='absolute inset-0 bg-cover bg-center filter blur-sm scale-110 transition-all duration-700'
          style={{
            backgroundImage: `url(${getBlurDataURL})`,
            opacity: isLoading ? 1 : 0,
          }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <Image
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          fill={!width || !height}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-all duration-700',
            !width || !height ? 'absolute inset-0 w-full h-full' : '',
            `object-${objectFit}`,
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
            hasError && 'filter grayscale'
          )}
          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
          {...(props as any)}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
          <div className='text-center text-gray-500'>
            <svg
              className='w-12 h-12 mx-auto mb-2 opacity-50'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                clipRule='evenodd'
              />
            </svg>
            <p className='text-xs'>Failed to load</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && !showSkeleton && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-50'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      )}
    </div>
  );
};

// Hook for progressive image loading
export const useProgressiveImage = (src: string, placeholderSrc?: string) => {
  const [currentSrc, setCurrentSrc] = React.useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    img.src = src;
  }, [src]);

  return { src: currentSrc, isLoading };
};

// Image gallery component with progressive loading
interface ImageGalleryProps {
  images: string[];
  aspectRatio?: string;
  className?: string;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  aspectRatio = '4/3',
  className,
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        aspectRatio={aspectRatio}
        className='w-full rounded-lg'
        priority={currentIndex === 0}
        onClick={() => onImageClick?.(currentIndex)}
      />

      {images.length > 1 && (
        <>
          {/* Navigation dots */}
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                )}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)}
            className='absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200'
          >
            <svg
              className='w-4 h-4 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>

          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % images.length)}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200'
          >
            <svg
              className='w-4 h-4 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
