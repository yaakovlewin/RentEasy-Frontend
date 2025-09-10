/**
 * @fileoverview Comprehensive TypeScript Interfaces for Gallery Data
 * 
 * Enterprise-grade type definitions for image gallery functionality following
 * patterns from Netflix, Google Photos, and Airbnb gallery implementations.
 * 
 * Features complete type safety for all gallery operations, transformations,
 * and user interactions.
 */

/**
 * Base image data structure
 */
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  originalUrl?: string;
  width: number;
  height: number;
  aspectRatio: number;
  format: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
  size: number; // Size in bytes
  alt: string;
  title?: string;
  caption?: string;
  credit?: string;
  metadata?: ImageMetadata;
  tags?: string[];
  order?: number;
  isHero?: boolean;
  isPrimary?: boolean;
}

/**
 * Image metadata structure
 */
export interface ImageMetadata {
  dateTaken?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  copyright?: string;
  author?: string;
  description?: string;
  keywords?: string[];
}

/**
 * Image size variants
 */
export interface ImageVariants {
  thumbnail: ImageVariant;
  small?: ImageVariant;
  medium: ImageVariant;
  large: ImageVariant;
  original: ImageVariant;
  hero?: ImageVariant;
  social?: ImageVariant; // For social media sharing
}

/**
 * Individual image variant
 */
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format?: string;
  quality?: number;
  size?: number;
}

/**
 * Gallery configuration
 */
export interface GalleryConfig {
  // Display options
  layout: 'grid' | 'carousel' | 'masonry' | 'slideshow' | 'mosaic';
  columns?: number;
  gap?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto' | 'original';
  imagefit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  
  // Navigation options
  navigation: {
    enabled: boolean;
    type: 'arrows' | 'dots' | 'thumbnails' | 'all';
    position?: 'inside' | 'outside' | 'bottom' | 'top';
    autoHide?: boolean;
    showCounter?: boolean;
  };
  
  // Interaction options
  interactions: {
    keyboard: boolean;
    touch: boolean;
    mouse: boolean;
    zoom: boolean;
    pan: boolean;
    rotate: boolean;
    fullscreen: boolean;
    download: boolean;
    share: boolean;
  };
  
  // Animation options
  animations: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom' | 'flip' | 'cube';
    duration: number;
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    pauseOnHover?: boolean;
  };
  
  // Performance options
  performance: {
    lazyLoad: boolean;
    preloadCount: number;
    virtualScrolling: boolean;
    progressiveLoading: boolean;
    cacheImages: boolean;
    optimizedFormats: boolean;
  };
  
  // Accessibility options
  accessibility: {
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    altTextRequired: boolean;
    focusIndicators: boolean;
    skipNavigation: boolean;
    announcements: boolean;
  };
  
  // Responsive options
  responsive?: ResponsiveConfig[];
}

/**
 * Responsive configuration
 */
export interface ResponsiveConfig {
  breakpoint: number;
  columns?: number;
  gap?: number;
  layout?: GalleryConfig['layout'];
  navigation?: Partial<GalleryConfig['navigation']>;
}

/**
 * Gallery state
 */
export interface GalleryState {
  images: GalleryImage[];
  currentIndex: number;
  selectedImages: Set<string>;
  viewMode: 'grid' | 'single' | 'fullscreen' | 'slideshow';
  isLoading: boolean;
  isFullscreen: boolean;
  isAutoPlaying: boolean;
  loadedImages: Set<string>;
  failedImages: Set<string>;
  filters: GalleryFilters;
  sort: GallerySort;
  zoom: {
    level: number;
    x: number;
    y: number;
  };
  history: number[];
}

/**
 * Gallery filters
 */
export interface GalleryFilters {
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  orientation?: 'landscape' | 'portrait' | 'square' | 'all';
  format?: string[];
  search?: string;
}

/**
 * Gallery sort options
 */
export interface GallerySort {
  field: 'order' | 'date' | 'name' | 'size' | 'random';
  direction: 'asc' | 'desc';
}

/**
 * Gallery events
 */
export interface GalleryEvents {
  onImageLoad?: (image: GalleryImage, index: number) => void;
  onImageError?: (error: Error, image: GalleryImage, index: number) => void;
  onImageChange?: (currentImage: GalleryImage, previousImage: GalleryImage | null) => void;
  onImageClick?: (image: GalleryImage, index: number, event: MouseEvent) => void;
  onImageHover?: (image: GalleryImage, index: number, event: MouseEvent) => void;
  onZoomChange?: (zoomLevel: number, image: GalleryImage) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onAutoPlayChange?: (isAutoPlaying: boolean) => void;
  onSelectionChange?: (selectedImages: GalleryImage[]) => void;
  onViewModeChange?: (viewMode: GalleryState['viewMode']) => void;
  onGalleryReady?: (images: GalleryImage[]) => void;
  onGalleryDestroy?: () => void;
}

/**
 * Gallery API methods
 */
export interface GalleryAPI {
  // Navigation
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  first: () => void;
  last: () => void;
  
  // View control
  setViewMode: (mode: GalleryState['viewMode']) => void;
  toggleFullscreen: () => void;
  toggleAutoPlay: () => void;
  
  // Zoom control
  zoomIn: (factor?: number) => void;
  zoomOut: (factor?: number) => void;
  resetZoom: () => void;
  setZoom: (level: number, x?: number, y?: number) => void;
  
  // Selection
  selectImage: (id: string) => void;
  deselectImage: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Filtering and sorting
  setFilters: (filters: Partial<GalleryFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: GallerySort) => void;
  
  // Image operations
  addImage: (image: GalleryImage, index?: number) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<GalleryImage>) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  
  // Data retrieval
  getCurrentImage: () => GalleryImage | null;
  getImage: (id: string) => GalleryImage | null;
  getImages: () => GalleryImage[];
  getSelectedImages: () => GalleryImage[];
  getVisibleImages: () => GalleryImage[];
  
  // Utility
  preloadImages: (indices: number[]) => Promise<void>;
  downloadImage: (id: string, variant?: keyof ImageVariants) => void;
  shareImage: (id: string, platform?: string) => void;
  refresh: () => void;
  destroy: () => void;
}

/**
 * Gallery touch gesture data
 */
export interface GalleryGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'doubletap' | 'pan' | 'rotate';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  scale?: number;
  rotation?: number;
  timestamp: number;
  duration: number;
}

/**
 * Gallery keyboard shortcuts
 */
export interface GalleryKeyboardShortcuts {
  next: string[];
  previous: string[];
  first: string[];
  last: string[];
  fullscreen: string[];
  close: string[];
  zoomIn: string[];
  zoomOut: string[];
  resetZoom: string[];
  autoPlay: string[];
  select: string[];
  download: string[];
  share: string[];
}

/**
 * Gallery theme configuration
 */
export interface GalleryTheme {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    overlay: string;
    border: string;
    shadow: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: number;
  transitions: {
    duration: number;
    easing: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

/**
 * Gallery loading state
 */
export interface GalleryLoadingState {
  isLoading: boolean;
  progress: number;
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  message?: string;
}

/**
 * Gallery error state
 */
export interface GalleryError {
  type: 'load' | 'network' | 'permission' | 'format' | 'unknown';
  message: string;
  image?: GalleryImage;
  index?: number;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Gallery analytics data
 */
export interface GalleryAnalytics {
  viewCount: number;
  viewDuration: number;
  interactions: {
    clicks: number;
    swipes: number;
    zooms: number;
    fullscreenToggles: number;
    downloads: number;
    shares: number;
  };
  performance: {
    loadTime: number;
    renderTime: number;
    averageImageLoadTime: number;
    cacheHitRate: number;
  };
  errors: GalleryError[];
}

/**
 * Gallery plugin interface
 */
export interface GalleryPlugin {
  name: string;
  version: string;
  init: (api: GalleryAPI, config: GalleryConfig) => void;
  destroy: () => void;
  hooks?: {
    beforeImageLoad?: (image: GalleryImage) => GalleryImage | Promise<GalleryImage>;
    afterImageLoad?: (image: GalleryImage) => void;
    beforeImageChange?: (newIndex: number, oldIndex: number) => boolean | Promise<boolean>;
    afterImageChange?: (newIndex: number, oldIndex: number) => void;
  };
}

/**
 * Image transformation options
 */
export interface ImageTransformation {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both';
  quality?: number;
  format?: 'jpg' | 'png' | 'webp' | 'avif';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: boolean;
  sepia?: boolean;
}

/**
 * Gallery share options
 */
export interface GalleryShareOptions {
  platforms: Array<'facebook' | 'twitter' | 'pinterest' | 'instagram' | 'whatsapp' | 'email' | 'link'>;
  customPlatforms?: Array<{
    name: string;
    icon: string;
    handler: (image: GalleryImage) => void;
  }>;
  title?: string;
  description?: string;
  hashtags?: string[];
}

/**
 * Type guards
 */
export const isGalleryImage = (obj: unknown): obj is GalleryImage => {
  return obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'url' in obj &&
    'width' in obj &&
    'height' in obj;
};

export const isImageVariant = (obj: unknown): obj is ImageVariant => {
  return obj !== null &&
    typeof obj === 'object' &&
    'url' in obj &&
    'width' in obj &&
    'height' in obj;
};

export const isGalleryError = (obj: unknown): obj is GalleryError => {
  return obj !== null &&
    typeof obj === 'object' &&
    'type' in obj &&
    'message' in obj &&
    'retryable' in obj;
};