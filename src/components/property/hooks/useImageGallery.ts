/**
 * @fileoverview useImageGallery Hook
 * 
 * Performance-optimized hook for image gallery state management with
 * keyboard navigation, touch gestures, and accessibility support.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ImageGalleryState } from '../types/PropertyDetails';

/**
 * Configuration options for image gallery
 */
export interface UseImageGalleryOptions {
  // Navigation options
  enableKeyboardNavigation?: boolean;
  enableTouchGestures?: boolean;
  enableAutoPlay?: boolean;
  autoPlayInterval?: number;
  
  // UI options
  enableFullscreen?: boolean;
  enableThumbnails?: boolean;
  enableDots?: boolean;
  
  // Performance options
  preloadImages?: boolean;
  lazyLoadThreshold?: number;
  
  // Event handlers
  onImageChange?: (index: number, image: string) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onImageLoad?: (index: number, success: boolean) => void;
}

/**
 * Touch gesture data
 */
interface TouchGestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  threshold: number;
}

/**
 * Return type for useImageGallery hook
 */
export interface UseImageGalleryReturn {
  // State
  currentIndex: number;
  images: string[];
  isFullscreen: boolean;
  isLoading: boolean;
  loadedImages: Set<number>;
  
  // Navigation
  nextImage: () => void;
  prevImage: () => void;
  goToImage: (index: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Fullscreen
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
  
  // Auto-play
  isAutoPlaying: boolean;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  toggleAutoPlay: () => void;
  
  // Utilities
  getCurrentImage: () => string;
  getImageUrl: (index: number, size?: 'thumbnail' | 'medium' | 'large') => string;
  preloadImage: (index: number) => Promise<void>;
  
  // Event handlers for components
  handleKeyDown: (event: KeyboardEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
  
  // Accessibility
  getImageAltText: (index: number) => string;
  getAriaLabel: () => string;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<UseImageGalleryOptions> = {
  enableKeyboardNavigation: true,
  enableTouchGestures: true,
  enableAutoPlay: false,
  autoPlayInterval: 5000,
  enableFullscreen: true,
  enableThumbnails: true,
  enableDots: true,
  preloadImages: true,
  lazyLoadThreshold: 2,
  onImageChange: () => {},
  onFullscreenToggle: () => {},
  onImageLoad: () => {},
};

/**
 * Get optimized image URL for different sizes
 */
function getOptimizedImageUrl(originalUrl: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
  // If it's an Unsplash URL, we can optimize it
  if (originalUrl.includes('unsplash.com')) {
    const sizeParams = {
      thumbnail: 'w=300&h=200&fit=crop',
      medium: 'w=800&h=600&fit=crop',
      large: 'w=1200&h=900&fit=crop',
    };
    
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${sizeParams[size]}`;
  }
  
  // For other URLs, return as-is
  return originalUrl;
}

/**
 * Preload image utility
 */
function preloadImageUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Main useImageGallery hook
 */
export function useImageGallery(
  images: string[],
  options: Partial<UseImageGalleryOptions> = {}
): UseImageGalleryReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStateRef = useRef<TouchGestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    threshold: 50,
  });
  
  // Ensure currentIndex is within bounds
  const safeCurrentIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.max(0, Math.min(currentIndex, images.length - 1));
  }, [currentIndex, images.length]);
  
  // Update currentIndex if it's out of bounds
  useEffect(() => {
    if (safeCurrentIndex !== currentIndex) {
      setCurrentIndex(safeCurrentIndex);
    }
  }, [safeCurrentIndex, currentIndex]);
  
  /**
   * Navigation functions
   */
  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    
    const nextIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    config.onImageChange(nextIndex, images[nextIndex]);
  }, [currentIndex, images, config]);
  
  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    
    const prevIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    config.onImageChange(prevIndex, images[prevIndex]);
  }, [currentIndex, images, config]);
  
  const goToImage = useCallback((index: number) => {
    if (images.length === 0 || index < 0 || index >= images.length) return;
    
    setCurrentIndex(index);
    config.onImageChange(index, images[index]);
  }, [images, config]);
  
  /**
   * Computed navigation state
   */
  const canGoNext = useMemo(() => images.length > 1, [images.length]);
  const canGoPrev = useMemo(() => images.length > 1, [images.length]);
  
  /**
   * Fullscreen functions
   */
  const toggleFullscreen = useCallback(() => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    config.onFullscreenToggle(newFullscreenState);
  }, [isFullscreen, config]);
  
  const exitFullscreen = useCallback(() => {
    if (isFullscreen) {
      setIsFullscreen(false);
      config.onFullscreenToggle(false);
    }
  }, [isFullscreen, config]);
  
  /**
   * Auto-play functions
   */
  const startAutoPlay = useCallback(() => {
    if (!config.enableAutoPlay || images.length <= 1) return;
    
    setIsAutoPlaying(true);
    
    autoPlayTimerRef.current = setInterval(() => {
      nextImage();
    }, config.autoPlayInterval);
  }, [config.enableAutoPlay, config.autoPlayInterval, images.length, nextImage]);
  
  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);
  
  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);
  
  /**
   * Utility functions
   */
  const getCurrentImage = useCallback(() => {
    return images[safeCurrentIndex] || '';
  }, [images, safeCurrentIndex]);
  
  const getImageUrl = useCallback((index: number, size: 'thumbnail' | 'medium' | 'large' = 'medium') => {
    if (index < 0 || index >= images.length) return '';
    return getOptimizedImageUrl(images[index], size);
  }, [images]);
  
  const preloadImage = useCallback(async (index: number) => {
    if (index < 0 || index >= images.length || loadedImages.has(index)) return;
    
    try {
      await preloadImageUrl(images[index]);
      setLoadedImages(prev => new Set([...prev, index]));
      config.onImageLoad(index, true);
    } catch (error) {
      config.onImageLoad(index, false);
    }
  }, [images, loadedImages, config]);
  
  /**
   * Keyboard navigation
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeyboardNavigation) return;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextImage();
        break;
      case 'Home':
        event.preventDefault();
        goToImage(0);
        break;
      case 'End':
        event.preventDefault();
        goToImage(images.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        if (isFullscreen) {
          exitFullscreen();
        }
        if (isAutoPlaying) {
          stopAutoPlay();
        }
        break;
      case ' ':
        event.preventDefault();
        toggleAutoPlay();
        break;
    }
  }, [config.enableKeyboardNavigation, prevImage, nextImage, goToImage, images.length, isFullscreen, exitFullscreen, isAutoPlaying, stopAutoPlay, toggleAutoPlay]);
  
  /**
   * Touch gesture handlers
   */
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!config.enableTouchGestures || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    touchStateRef.current = {
      ...touchStateRef.current,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
    };
    
    // Stop auto-play on touch
    if (isAutoPlaying) {
      stopAutoPlay();
    }
  }, [config.enableTouchGestures, isAutoPlaying, stopAutoPlay]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!config.enableTouchGestures || !touchStateRef.current.isDragging || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    touchStateRef.current.currentX = touch.clientX;
    touchStateRef.current.currentY = touch.clientY;
  }, [config.enableTouchGestures]);
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!config.enableTouchGestures || !touchStateRef.current.isDragging) return;
    
    const { startX, currentX, threshold } = touchStateRef.current;
    const deltaX = currentX - startX;
    const absDeltaX = Math.abs(deltaX);
    
    if (absDeltaX > threshold) {
      if (deltaX > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
    
    touchStateRef.current.isDragging = false;
  }, [config.enableTouchGestures, prevImage, nextImage]);
  
  /**
   * Accessibility helpers
   */
  const getImageAltText = useCallback((index: number) => {
    return `Property image ${index + 1} of ${images.length}`;
  }, [images.length]);
  
  const getAriaLabel = useCallback(() => {
    return `Image gallery, showing image ${safeCurrentIndex + 1} of ${images.length}`;
  }, [safeCurrentIndex, images.length]);
  
  /**
   * Auto-play cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, []);
  
  /**
   * Preload adjacent images
   */
  useEffect(() => {
    if (!config.preloadImages || images.length === 0) return;
    
    const preloadIndices: number[] = [];
    
    // Always preload current image
    preloadIndices.push(safeCurrentIndex);
    
    // Preload adjacent images based on threshold
    for (let i = 1; i <= config.lazyLoadThreshold; i++) {
      const nextIndex = (safeCurrentIndex + i) % images.length;
      const prevIndex = (safeCurrentIndex - i + images.length) % images.length;
      
      preloadIndices.push(nextIndex, prevIndex);
    }
    
    // Remove duplicates and preload
    const uniqueIndices = [...new Set(preloadIndices)];
    uniqueIndices.forEach(index => {
      preloadImage(index);
    });
  }, [safeCurrentIndex, images.length, config.preloadImages, config.lazyLoadThreshold, preloadImage]);
  
  return {
    // State
    currentIndex: safeCurrentIndex,
    images,
    isFullscreen,
    isLoading,
    loadedImages,
    
    // Navigation
    nextImage,
    prevImage,
    goToImage,
    canGoNext,
    canGoPrev,
    
    // Fullscreen
    toggleFullscreen,
    exitFullscreen,
    
    // Auto-play
    isAutoPlaying,
    startAutoPlay,
    stopAutoPlay,
    toggleAutoPlay,
    
    // Utilities
    getCurrentImage,
    getImageUrl,
    preloadImage,
    
    // Event handlers
    handleKeyDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Accessibility
    getImageAltText,
    getAriaLabel,
  };
}