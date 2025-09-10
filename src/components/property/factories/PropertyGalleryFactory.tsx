/**
 * @fileoverview PropertyGalleryFactory
 * 
 * Enterprise-grade factory for property image gallery management following
 * patterns from Netflix, Google Photos, and Airbnb implementations.
 * 
 * Features comprehensive image handling, optimization, validation,
 * and gallery configuration with performance optimizations.
 */

import React, { ComponentType, ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { 
  GalleryImage, 
  GalleryConfig, 
  ImageVariants, 
  ImageTransformation,
  GalleryShareOptions,
  GalleryTheme,
  ImageMetadata,
  isGalleryImage 
} from '../types/GalleryTypes';

/**
 * Configuration for PropertyGalleryFactory
 */
export interface PropertyGalleryFactoryConfig {
  /** Default image optimization settings */
  optimization: {
    quality: number;
    formats: Array<'webp' | 'avif' | 'jpg' | 'png'>;
    sizes: string;
    priority: boolean;
  };
  
  /** CDN configuration */
  cdn: {
    baseUrl?: string;
    transformationEndpoint?: string;
    cacheControl?: string;
  };
  
  /** Fallback configuration */
  fallbacks: {
    placeholderUrl: string;
    errorUrl: string;
    loadingComponent?: ComponentType;
    errorComponent?: ComponentType<{ error: Error; retry: () => void }>;
  };
  
  /** Performance settings */
  performance: {
    lazyLoadOffset: number;
    preloadCount: number;
    maxCacheSize: number;
    debounceDelay: number;
  };
  
  /** Accessibility settings */
  accessibility: {
    defaultAltPrefix: string;
    includeImageCount: boolean;
    enableKeyboardNavigation: boolean;
    announcements: boolean;
  };
}

/**
 * Gallery creation options
 */
export interface GalleryCreationOptions {
  /** Gallery type */
  type: 'property' | 'hero' | 'thumbnail' | 'slideshow' | 'grid' | 'masonry';
  /** Layout configuration */
  layout: {
    columns?: number;
    aspectRatio?: string;
    gap?: number;
    maxHeight?: string;
  };
  /** Interaction settings */
  interactions: {
    clickable?: boolean;
    zoomable?: boolean;
    downloadable?: boolean;
    shareable?: boolean;
  };
  /** Theme override */
  theme?: Partial<GalleryTheme>;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Image processing result
 */
export interface ProcessedImage extends GalleryImage {
  /** Processed variants */
  variants: ImageVariants;
  /** Processing metadata */
  processing: {
    processedAt: Date;
    optimized: boolean;
    transformations: ImageTransformation[];
  };
}

/**
 * Gallery component props
 */
export interface GalleryComponentProps {
  images: ProcessedImage[];
  config: GalleryConfig;
  onImageSelect?: (image: ProcessedImage, index: number) => void;
  onError?: (error: Error, image: ProcessedImage) => void;
  className?: string;
}

/**
 * Default factory configuration
 */
const DEFAULT_CONFIG: PropertyGalleryFactoryConfig = {
  optimization: {
    quality: 85,
    formats: ['webp', 'jpg'],
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    priority: false,
  },
  cdn: {
    cacheControl: 'public, max-age=31536000, immutable',
  },
  fallbacks: {
    placeholderUrl: '/images/property-placeholder.jpg',
    errorUrl: '/images/property-error.jpg',
  },
  performance: {
    lazyLoadOffset: 100,
    preloadCount: 3,
    maxCacheSize: 100,
    debounceDelay: 300,
  },
  accessibility: {
    defaultAltPrefix: 'Property image',
    includeImageCount: true,
    enableKeyboardNavigation: true,
    announcements: true,
  },
};

/**
 * Image URL transformation utilities
 */
class ImageTransformationEngine {
  /**
   * Generate optimized image URL
   */
  static generateOptimizedUrl(
    originalUrl: string,
    transformation: ImageTransformation,
    cdnConfig?: PropertyGalleryFactoryConfig['cdn']
  ): string {
    // Handle Unsplash optimization
    if (originalUrl.includes('unsplash.com')) {
      return this.optimizeUnsplashUrl(originalUrl, transformation);
    }
    
    // Handle custom CDN
    if (cdnConfig?.transformationEndpoint) {
      return this.optimizeCustomCdnUrl(originalUrl, transformation, cdnConfig);
    }
    
    // Return original URL if no optimization available
    return originalUrl;
  }
  
  /**
   * Optimize Unsplash URLs
   */
  private static optimizeUnsplashUrl(
    url: string,
    transformation: ImageTransformation
  ): string {
    const params = new URLSearchParams();
    
    if (transformation.resize) {
      if (transformation.resize.width) params.set('w', transformation.resize.width.toString());
      if (transformation.resize.height) params.set('h', transformation.resize.height.toString());
      if (transformation.resize.fit) params.set('fit', transformation.resize.fit);
    }
    
    if (transformation.crop) {
      params.set('crop', 'faces,center');
    }
    
    if (transformation.quality) {
      params.set('q', transformation.quality.toString());
    }
    
    if (transformation.format) {
      params.set('fm', transformation.format);
    }
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }
  
  /**
   * Optimize custom CDN URLs
   */
  private static optimizeCustomCdnUrl(
    url: string,
    transformation: ImageTransformation,
    cdnConfig: NonNullable<PropertyGalleryFactoryConfig['cdn']>
  ): string {
    // Implementation would depend on specific CDN provider
    // This is a template for custom CDN integration
    return `${cdnConfig.transformationEndpoint}?url=${encodeURIComponent(url)}&transform=${encodeURIComponent(JSON.stringify(transformation))}`;
  }
  
  /**
   * Create image variants for different display sizes
   */
  static createImageVariants(
    originalUrl: string,
    baseWidth: number,
    baseHeight: number,
    cdnConfig?: PropertyGalleryFactoryConfig['cdn']
  ): ImageVariants {
    const aspectRatio = baseWidth / baseHeight;
    
    return {
      thumbnail: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 300, height: Math.round(300 / aspectRatio), fit: 'cover' },
          quality: 70,
          format: 'webp',
        }, cdnConfig),
        width: 300,
        height: Math.round(300 / aspectRatio),
        format: 'webp',
        quality: 70,
      },
      small: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 600, height: Math.round(600 / aspectRatio), fit: 'cover' },
          quality: 80,
          format: 'webp',
        }, cdnConfig),
        width: 600,
        height: Math.round(600 / aspectRatio),
        format: 'webp',
        quality: 80,
      },
      medium: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 1200, height: Math.round(1200 / aspectRatio), fit: 'cover' },
          quality: 85,
          format: 'webp',
        }, cdnConfig),
        width: 1200,
        height: Math.round(1200 / aspectRatio),
        format: 'webp',
        quality: 85,
      },
      large: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 1920, height: Math.round(1920 / aspectRatio), fit: 'cover' },
          quality: 90,
          format: 'webp',
        }, cdnConfig),
        width: 1920,
        height: Math.round(1920 / aspectRatio),
        format: 'webp',
        quality: 90,
      },
      original: {
        url: originalUrl,
        width: baseWidth,
        height: baseHeight,
        format: 'jpg',
        quality: 100,
      },
      hero: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 2400, height: 1200, fit: 'cover' },
          quality: 95,
          format: 'webp',
        }, cdnConfig),
        width: 2400,
        height: 1200,
        format: 'webp',
        quality: 95,
      },
      social: {
        url: this.generateOptimizedUrl(originalUrl, {
          resize: { width: 1200, height: 630, fit: 'cover' },
          quality: 85,
          format: 'jpg',
        }, cdnConfig),
        width: 1200,
        height: 630,
        format: 'jpg',
        quality: 85,
      },
    };
  }
}

/**
 * Image validation and processing utilities
 */
class ImageProcessor {
  /**
   * Validate image URL and extract metadata
   */
  static async validateAndProcessImage(
    url: string,
    index: number,
    config: PropertyGalleryFactoryConfig
  ): Promise<ProcessedImage | null> {
    try {
      // Basic URL validation
      new URL(url);
      
      // Create basic image data
      const imageData: GalleryImage = {
        id: `image-${index}-${Date.now()}`,
        url,
        width: 1200, // Default dimensions
        height: 800,
        aspectRatio: 1.5,
        format: this.extractFormatFromUrl(url),
        size: 0, // Would be determined server-side
        alt: `${config.accessibility.defaultAltPrefix} ${index + 1}`,
        order: index,
      };
      
      // Generate optimized variants
      const variants = ImageTransformationEngine.createImageVariants(
        url,
        imageData.width,
        imageData.height,
        config.cdn
      );
      
      // Create processed image
      const processedImage: ProcessedImage = {
        ...imageData,
        variants,
        processing: {
          processedAt: new Date(),
          optimized: true,
          transformations: [
            { resize: { width: 1200, height: 800, fit: 'cover' } },
            { quality: config.optimization.quality },
          ],
        },
      };
      
      return processedImage;
    } catch (error) {
      console.warn(`Failed to process image: ${url}`, error);
      return null;
    }
  }
  
  /**
   * Extract image format from URL
   */
  private static extractFormatFromUrl(url: string): GalleryImage['format'] {
    const lowercaseUrl = url.toLowerCase();
    
    if (lowercaseUrl.includes('.webp') || lowercaseUrl.includes('fm=webp')) return 'webp';
    if (lowercaseUrl.includes('.avif') || lowercaseUrl.includes('fm=avif')) return 'avif';
    if (lowercaseUrl.includes('.png') || lowercaseUrl.includes('fm=png')) return 'png';
    if (lowercaseUrl.includes('.jpeg') || lowercaseUrl.includes('.jpg')) return 'jpeg';
    
    return 'jpg'; // Default fallback
  }
  
  /**
   * Batch process multiple images
   */
  static async processImageBatch(
    urls: string[],
    config: PropertyGalleryFactoryConfig
  ): Promise<ProcessedImage[]> {
    const processedImages = await Promise.allSettled(
      urls.map((url, index) => this.validateAndProcessImage(url, index, config))
    );
    
    return processedImages
      .filter((result): result is PromiseFulfilledResult<ProcessedImage> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
}

/**
 * Gallery configuration presets
 */
class GalleryPresets {
  /**
   * Property hero gallery configuration
   */
  static getHeroGalleryConfig(overrides?: Partial<GalleryConfig>): GalleryConfig {
    return {
      layout: 'carousel',
      aspectRatio: '16:9',
      imagefit: 'cover',
      
      navigation: {
        enabled: true,
        type: 'all',
        position: 'inside',
        autoHide: false,
        showCounter: true,
      },
      
      interactions: {
        keyboard: true,
        touch: true,
        mouse: true,
        zoom: true,
        pan: false,
        rotate: false,
        fullscreen: true,
        download: false,
        share: true,
      },
      
      animations: {
        enabled: true,
        type: 'slide',
        duration: 300,
        easing: 'ease-out',
        autoPlay: false,
        autoPlayInterval: 5000,
        pauseOnHover: true,
      },
      
      performance: {
        lazyLoad: true,
        preloadCount: 2,
        virtualScrolling: false,
        progressiveLoading: true,
        cacheImages: true,
        optimizedFormats: true,
      },
      
      accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        altTextRequired: true,
        focusIndicators: true,
        skipNavigation: true,
        announcements: true,
      },
      
      responsive: [
        { breakpoint: 768, columns: 1, layout: 'carousel' },
        { breakpoint: 1024, columns: 1, layout: 'carousel' },
      ],
      
      ...overrides,
    };
  }
  
  /**
   * Property grid gallery configuration
   */
  static getGridGalleryConfig(overrides?: Partial<GalleryConfig>): GalleryConfig {
    return {
      layout: 'grid',
      columns: 3,
      gap: 16,
      aspectRatio: '4:3',
      imagefit: 'cover',
      
      navigation: {
        enabled: false,
        type: 'dots',
        position: 'bottom',
      },
      
      interactions: {
        keyboard: true,
        touch: false,
        mouse: true,
        zoom: false,
        pan: false,
        rotate: false,
        fullscreen: true,
        download: false,
        share: false,
      },
      
      animations: {
        enabled: true,
        type: 'fade',
        duration: 200,
        easing: 'ease-in-out',
        autoPlay: false,
      },
      
      performance: {
        lazyLoad: true,
        preloadCount: 6,
        virtualScrolling: true,
        progressiveLoading: true,
        cacheImages: true,
        optimizedFormats: true,
      },
      
      accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        altTextRequired: true,
        focusIndicators: true,
        skipNavigation: false,
        announcements: false,
      },
      
      responsive: [
        { breakpoint: 640, columns: 1, gap: 8 },
        { breakpoint: 768, columns: 2, gap: 12 },
        { breakpoint: 1024, columns: 3, gap: 16 },
      ],
      
      ...overrides,
    };
  }
  
  /**
   * Property thumbnail gallery configuration
   */
  static getThumbnailGalleryConfig(overrides?: Partial<GalleryConfig>): GalleryConfig {
    return {
      layout: 'grid',
      columns: 6,
      gap: 8,
      aspectRatio: '1:1',
      imagefit: 'cover',
      
      navigation: {
        enabled: false,
        type: 'dots',
        position: 'bottom',
      },
      
      interactions: {
        keyboard: false,
        touch: false,
        mouse: true,
        zoom: false,
        pan: false,
        rotate: false,
        fullscreen: false,
        download: false,
        share: false,
      },
      
      animations: {
        enabled: true,
        type: 'fade',
        duration: 150,
        easing: 'ease-out',
        autoPlay: false,
      },
      
      performance: {
        lazyLoad: true,
        preloadCount: 12,
        virtualScrolling: false,
        progressiveLoading: false,
        cacheImages: true,
        optimizedFormats: true,
      },
      
      accessibility: {
        keyboardNavigation: false,
        screenReaderSupport: true,
        altTextRequired: true,
        focusIndicators: false,
        skipNavigation: false,
        announcements: false,
      },
      
      responsive: [
        { breakpoint: 640, columns: 3, gap: 4 },
        { breakpoint: 768, columns: 4, gap: 6 },
        { breakpoint: 1024, columns: 6, gap: 8 },
      ],
      
      ...overrides,
    };
  }
}

/**
 * Main PropertyGalleryFactory class
 */
export class PropertyGalleryFactory {
  private config: PropertyGalleryFactoryConfig;
  private imageCache = new Map<string, ProcessedImage>();
  
  constructor(config: Partial<PropertyGalleryFactoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Create a property gallery from image URLs
   */
  async createGallery(
    imageUrls: string[],
    options: GalleryCreationOptions
  ): Promise<{
    images: ProcessedImage[];
    config: GalleryConfig;
    component: ComponentType<GalleryComponentProps>;
  }> {
    // Process images
    const images = await ImageProcessor.processImageBatch(imageUrls, this.config);
    
    // Get gallery configuration based on type
    const config = this.getGalleryConfig(options.type, options);
    
    // Create gallery component
    const component = this.createGalleryComponent(options);
    
    return { images, config, component };
  }
  
  /**
   * Create a hero gallery for property details
   */
  async createHeroGallery(imageUrls: string[], className?: string): Promise<{
    images: ProcessedImage[];
    config: GalleryConfig;
    component: ComponentType<GalleryComponentProps>;
  }> {
    return this.createGallery(imageUrls, {
      type: 'hero',
      layout: { aspectRatio: '16:9', maxHeight: '500px' },
      interactions: { clickable: true, zoomable: true, shareable: true },
      className,
    });
  }
  
  /**
   * Create a grid gallery for property listings
   */
  async createGridGallery(
    imageUrls: string[],
    columns: number = 3,
    className?: string
  ): Promise<{
    images: ProcessedImage[];
    config: GalleryConfig;
    component: ComponentType<GalleryComponentProps>;
  }> {
    return this.createGallery(imageUrls, {
      type: 'grid',
      layout: { columns, aspectRatio: '4:3', gap: 16 },
      interactions: { clickable: true },
      className,
    });
  }
  
  /**
   * Create a thumbnail gallery for quick previews
   */
  async createThumbnailGallery(
    imageUrls: string[],
    onSelect?: (image: ProcessedImage, index: number) => void,
    className?: string
  ): Promise<{
    images: ProcessedImage[];
    config: GalleryConfig;
    component: ComponentType<GalleryComponentProps>;
  }> {
    const gallery = await this.createGallery(imageUrls, {
      type: 'thumbnail',
      layout: { columns: 6, aspectRatio: '1:1', gap: 8 },
      interactions: { clickable: true },
      className,
    });
    
    // Override component to include selection handler
    const OriginalComponent = gallery.component;
    gallery.component = (props: GalleryComponentProps) => (
      <OriginalComponent {...props} onImageSelect={onSelect} />
    );
    
    return gallery;
  }
  
  /**
   * Get gallery configuration based on type
   */
  private getGalleryConfig(
    type: GalleryCreationOptions['type'],
    options: GalleryCreationOptions
  ): GalleryConfig {
    let baseConfig: GalleryConfig;
    
    switch (type) {
      case 'hero':
        baseConfig = GalleryPresets.getHeroGalleryConfig();
        break;
      case 'grid':
      case 'masonry':
        baseConfig = GalleryPresets.getGridGalleryConfig();
        break;
      case 'thumbnail':
        baseConfig = GalleryPresets.getThumbnailGalleryConfig();
        break;
      default:
        baseConfig = GalleryPresets.getHeroGalleryConfig();
    }
    
    // Apply layout overrides
    if (options.layout.columns !== undefined) {
      baseConfig.columns = options.layout.columns;
    }
    if (options.layout.aspectRatio) {
      baseConfig.aspectRatio = options.layout.aspectRatio as any;
    }
    if (options.layout.gap !== undefined) {
      baseConfig.gap = options.layout.gap;
    }
    
    return baseConfig;
  }
  
  /**
   * Create gallery component based on options
   */
  private createGalleryComponent(options: GalleryCreationOptions): ComponentType<GalleryComponentProps> {
    return ({ images, config, onImageSelect, onError, className }: GalleryComponentProps) => {
      const galleryClassName = cn(
        'property-gallery',
        `gallery-${options.type}`,
        options.className,
        className
      );
      
      switch (options.type) {
        case 'hero':
          return (
            <div className={cn(galleryClassName, 'relative overflow-hidden rounded-xl')}>
              {this.renderHeroGallery(images, config, onImageSelect, onError)}
            </div>
          );
          
        case 'grid':
        case 'masonry':
          return (
            <div className={cn(galleryClassName, 'grid gap-4')}>
              {this.renderGridGallery(images, config, onImageSelect, onError)}
            </div>
          );
          
        case 'thumbnail':
          return (
            <div className={cn(galleryClassName, 'flex flex-wrap gap-2')}>
              {this.renderThumbnailGallery(images, config, onImageSelect, onError)}
            </div>
          );
          
        default:
          return (
            <div className={galleryClassName}>
              {this.renderDefaultGallery(images, config, onImageSelect, onError)}
            </div>
          );
      }
    };
  }
  
  /**
   * Render hero gallery
   */
  private renderHeroGallery(
    images: ProcessedImage[],
    config: GalleryConfig,
    onImageSelect?: (image: ProcessedImage, index: number) => void,
    onError?: (error: Error, image: ProcessedImage) => void
  ): ReactNode {
    if (images.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl">
          <p className="text-gray-500">No images available</p>
        </div>
      );
    }
    
    // For demo purposes, show first image with basic Next.js Image
    const firstImage = images[0];
    
    return (
      <div className="relative h-96 lg:h-[500px]">
        <Image
          src={firstImage.variants.large.url}
          alt={firstImage.alt}
          fill
          className="object-cover"
          priority={this.config.optimization.priority}
          sizes={this.config.optimization.sizes}
          onClick={() => onImageSelect?.(firstImage, 0)}
          onError={(e) => {
            const error = new Error(`Failed to load image: ${firstImage.url}`);
            onError?.(error, firstImage);
          }}
        />
        
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            1 / {images.length}
          </div>
        )}
      </div>
    );
  }
  
  /**
   * Render grid gallery
   */
  private renderGridGallery(
    images: ProcessedImage[],
    config: GalleryConfig,
    onImageSelect?: (image: ProcessedImage, index: number) => void,
    onError?: (error: Error, image: ProcessedImage) => void
  ): ReactNode {
    const columns = config.columns || 3;
    
    return (
      <div 
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {images.map((image, index) => (
          <div 
            key={image.id}
            className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageSelect?.(image, index)}
          >
            <Image
              src={image.variants.medium.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                const error = new Error(`Failed to load image: ${image.url}`);
                onError?.(error, image);
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  
  /**
   * Render thumbnail gallery
   */
  private renderThumbnailGallery(
    images: ProcessedImage[],
    config: GalleryConfig,
    onImageSelect?: (image: ProcessedImage, index: number) => void,
    onError?: (error: Error, image: ProcessedImage) => void
  ): ReactNode {
    return (
      <>
        {images.slice(0, 12).map((image, index) => (
          <div 
            key={image.id}
            className="relative w-16 h-16 overflow-hidden rounded cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageSelect?.(image, index)}
          >
            <Image
              src={image.variants.thumbnail.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => {
                const error = new Error(`Failed to load image: ${image.url}`);
                onError?.(error, image);
              }}
            />
          </div>
        ))}
      </>
    );
  }
  
  /**
   * Render default gallery
   */
  private renderDefaultGallery(
    images: ProcessedImage[],
    config: GalleryConfig,
    onImageSelect?: (image: ProcessedImage, index: number) => void,
    onError?: (error: Error, image: ProcessedImage) => void
  ): ReactNode {
    return this.renderHeroGallery(images, config, onImageSelect, onError);
  }
  
  /**
   * Process single image URL
   */
  async processSingleImage(url: string): Promise<ProcessedImage | null> {
    // Check cache first
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }
    
    // Process image
    const processedImage = await ImageProcessor.validateAndProcessImage(url, 0, this.config);
    
    // Cache result
    if (processedImage) {
      this.imageCache.set(url, processedImage);
      
      // Manage cache size
      if (this.imageCache.size > this.config.performance.maxCacheSize) {
        const firstKey = this.imageCache.keys().next().value;
        this.imageCache.delete(firstKey);
      }
    }
    
    return processedImage;
  }
  
  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.imageCache.size,
      maxSize: this.config.performance.maxCacheSize,
      hitRate: 0, // Would need to implement hit tracking
    };
  }
}

/**
 * Default factory instance
 */
export const propertyGalleryFactory = new PropertyGalleryFactory();

/**
 * Convenience functions for common gallery types
 */
export const createHeroGallery = (imageUrls: string[], className?: string) =>
  propertyGalleryFactory.createHeroGallery(imageUrls, className);

export const createGridGallery = (imageUrls: string[], columns?: number, className?: string) =>
  propertyGalleryFactory.createGridGallery(imageUrls, columns, className);

export const createThumbnailGallery = (
  imageUrls: string[],
  onSelect?: (image: ProcessedImage, index: number) => void,
  className?: string
) => propertyGalleryFactory.createThumbnailGallery(imageUrls, onSelect, className);