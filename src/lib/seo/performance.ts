/**
 * Performance SEO Optimization System - RentEasy
 * 
 * Advanced performance optimizations specifically designed for SEO impact.
 * Focuses on Core Web Vitals, loading strategies, and search engine accessibility.
 * 
 * Features:
 * - Intelligent image loading with SEO-optimized alt text
 * - Progressive content enhancement for crawlers
 * - SEO-friendly lazy loading strategies
 * - Critical resource prioritization
 * - Performance budget monitoring
 * - Search engine friendly loading states
 */

import type { ComponentType } from 'react';

// ============================================================================
// IMAGE OPTIMIZATION FOR SEO
// ============================================================================

interface SEOOptimizedImageConfig {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
}

/**
 * Generate comprehensive image configurations for SEO
 */
export function generateSEOImageConfig(
  baseConfig: Partial<SEOOptimizedImageConfig>,
  context?: {
    isAboveFold?: boolean;
    isHero?: boolean;
    isThumbnail?: boolean;
    isGallery?: boolean;
    propertyName?: string;
    location?: string;
  }
): SEOOptimizedImageConfig {
  const config: SEOOptimizedImageConfig = {
    src: baseConfig.src || '',
    alt: baseConfig.alt || '',
    loading: 'lazy',
    decoding: 'async',
    quality: 85,
    ...baseConfig,
  };

  // Context-specific optimizations
  if (context) {
    // Above-the-fold images should be prioritized
    if (context.isAboveFold || context.isHero) {
      config.priority = true;
      config.loading = 'eager';
      config.quality = 90;
    }

    // Enhance alt text with context
    if (context.propertyName && !config.alt.includes(context.propertyName)) {
      if (context.location) {
        config.alt = `${config.alt} - ${context.propertyName} in ${context.location}`;
      } else {
        config.alt = `${config.alt} - ${context.propertyName}`;
      }
    }

    // Gallery images get specific treatment
    if (context.isGallery) {
      config.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      config.quality = 80;
    }

    // Thumbnails can be lower quality
    if (context.isThumbnail) {
      config.quality = 75;
      config.sizes = '(max-width: 768px) 50vw, 25vw';
    }
  }

  return config;
}

/**
 * Generate responsive image sizes for different contexts
 */
export function generateResponsiveSizes(context: {
  breakpoints?: Record<string, number>;
  maxWidth?: number;
  aspectRatio?: number;
}): string {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  };

  const breakpoints = { ...defaultBreakpoints, ...context.breakpoints };
  const maxWidth = context.maxWidth || 1200;

  // Generate sizes string
  const sizes = Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([name, width], index, array) => {
      const isLast = index === array.length - 1;
      const percentage = Math.min(100, (maxWidth / width) * 100);
      
      return isLast 
        ? `${Math.round(percentage)}vw`
        : `(max-width: ${width}px) ${Math.round(percentage)}vw`;
    })
    .join(', ');

  return sizes;
}

// ============================================================================
// PROGRESSIVE CONTENT LOADING
// ============================================================================

interface ProgressiveLoadingConfig {
  priority: 'critical' | 'high' | 'normal' | 'low';
  defer?: boolean;
  preload?: boolean;
  prefetch?: boolean;
  modulePreload?: boolean;
  timeout?: number;
}

/**
 * Progressive content loading strategy for SEO
 */
export class ProgressiveContentLoader {
  private loadedResources = new Set<string>();
  private observer?: IntersectionObserver;

  constructor(private config?: {
    rootMargin?: string;
    threshold?: number;
    enableLogging?: boolean;
  }) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.initializeObserver();
    }
  }

  private initializeObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const loadConfig = this.getLoadConfigFromElement(element);
            this.loadContent(element, loadConfig);
            this.observer?.unobserve(element);
          }
        });
      },
      {
        rootMargin: this.config?.rootMargin || '50px',
        threshold: this.config?.threshold || 0.1,
      }
    );
  }

  private getLoadConfigFromElement(element: HTMLElement): ProgressiveLoadingConfig {
    const priority = element.getAttribute('data-load-priority') as ProgressiveLoadingConfig['priority'] || 'normal';
    const defer = element.hasAttribute('data-defer');
    const preload = element.hasAttribute('data-preload');
    
    return {
      priority,
      defer,
      preload,
      timeout: parseInt(element.getAttribute('data-timeout') || '5000'),
    };
  }

  public observeElement(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback: load immediately if IntersectionObserver is not available
      const loadConfig = this.getLoadConfigFromElement(element);
      this.loadContent(element, loadConfig);
    }
  }

  public loadContent(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    const resourceId = element.getAttribute('data-resource-id');
    if (resourceId && this.loadedResources.has(resourceId)) {
      return;
    }

    // Mark as loading
    element.setAttribute('data-loading', 'true');

    // Execute loading based on priority
    switch (config.priority) {
      case 'critical':
        this.loadCriticalContent(element, config);
        break;
      case 'high':
        this.loadHighPriorityContent(element, config);
        break;
      case 'normal':
        this.loadNormalContent(element, config);
        break;
      case 'low':
        this.loadLowPriorityContent(element, config);
        break;
    }

    if (resourceId) {
      this.loadedResources.add(resourceId);
    }
  }

  private loadCriticalContent(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    // Immediate loading for critical content
    this.executeLoad(element, config);
  }

  private loadHighPriorityContent(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    // Slight delay to allow critical content to load first
    setTimeout(() => {
      this.executeLoad(element, config);
    }, 10);
  }

  private loadNormalContent(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.executeLoad(element, config);
      });
    } else {
      setTimeout(() => {
        this.executeLoad(element, config);
      }, 100);
    }
  }

  private loadLowPriorityContent(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    // Defer until after other content has loaded
    setTimeout(() => {
      this.executeLoad(element, config);
    }, 500);
  }

  private executeLoad(element: HTMLElement, config: ProgressiveLoadingConfig): void {
    try {
      // Trigger custom load event
      const loadEvent = new CustomEvent('progressiveLoad', {
        detail: { element, config },
        bubbles: true,
      });
      element.dispatchEvent(loadEvent);

      // Remove loading state
      element.removeAttribute('data-loading');
      element.setAttribute('data-loaded', 'true');

      // Log if enabled
      if (this.config?.enableLogging && process.env.NODE_ENV === 'development') {
        console.log('Progressive load:', element, config);
      }
    } catch (error) {
      console.error('Progressive loading error:', error);
      element.removeAttribute('data-loading');
      element.setAttribute('data-load-error', 'true');
    }
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedResources.clear();
  }
}

// ============================================================================
// SEO-OPTIMIZED LAZY LOADING
// ============================================================================

/**
 * SEO-friendly lazy loading that preserves content for crawlers
 */
export function createSEOLazyLoader(options?: {
  rootMargin?: string;
  threshold?: number;
  fallbackToNoJS?: boolean;
  preserveForCrawlers?: boolean;
}) {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    fallbackToNoJS: true,
    preserveForCrawlers: true,
    ...options,
  };

  let observer: IntersectionObserver;

  const init = () => {
    if (typeof window === 'undefined') return;

    // Check if JavaScript is disabled or if we should preserve for crawlers
    const noJS = !window.navigator || window.navigator.userAgent.includes('bot');
    if (noJS && defaultOptions.preserveForCrawlers) {
      // Load all content immediately for crawlers/no-JS
      const lazyElements = document.querySelectorAll('[data-lazy]');
      lazyElements.forEach(element => {
        loadElement(element as HTMLElement);
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      if (defaultOptions.fallbackToNoJS) {
        // Fallback: load all content
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
          loadElement(element as HTMLElement);
        });
      }
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadElement(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: defaultOptions.rootMargin,
      threshold: defaultOptions.threshold,
    });

    // Observe all lazy elements
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach(element => {
      observer.observe(element);
    });
  };

  const loadElement = (element: HTMLElement) => {
    // Handle different element types
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const src = img.getAttribute('data-src');
      const srcset = img.getAttribute('data-srcset');
      
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
      if (srcset) {
        img.srcset = srcset;
        img.removeAttribute('data-srcset');
      }
    }

    // Handle background images
    const bgImage = element.getAttribute('data-bg');
    if (bgImage) {
      element.style.backgroundImage = `url(${bgImage})`;
      element.removeAttribute('data-bg');
    }

    // Handle iframe lazy loading
    if (element.tagName === 'IFRAME') {
      const iframe = element as HTMLIFrameElement;
      const src = iframe.getAttribute('data-src');
      if (src) {
        iframe.src = src;
        iframe.removeAttribute('data-src');
      }
    }

    // Remove lazy class and add loaded class
    element.classList.remove('lazy');
    element.classList.add('lazy-loaded');
    element.removeAttribute('data-lazy');
  };

  const destroy = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  return { init, destroy, loadElement };
}

// ============================================================================
// CRITICAL RESOURCE PRIORITIZATION
// ============================================================================

interface CriticalResource {
  type: 'script' | 'style' | 'font' | 'image' | 'fetch';
  url: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  preload?: boolean;
  prefetch?: boolean;
  modulePreload?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  as?: string;
}

/**
 * Critical resource prioritization for SEO performance
 */
export class CriticalResourceManager {
  private loadedResources = new Set<string>();
  private preloadQueue: CriticalResource[] = [];

  /**
   * Add critical resources that should be prioritized
   */
  public addCriticalResource(resource: CriticalResource): void {
    this.preloadQueue.push(resource);
    
    if (typeof document !== 'undefined') {
      this.processResource(resource);
    }
  }

  /**
   * Add multiple critical resources
   */
  public addCriticalResources(resources: CriticalResource[]): void {
    resources.forEach(resource => this.addCriticalResource(resource));
  }

  private processResource(resource: CriticalResource): void {
    if (this.loadedResources.has(resource.url)) {
      return;
    }

    switch (resource.priority) {
      case 'critical':
        this.preloadResource(resource);
        break;
      case 'high':
        setTimeout(() => this.preloadResource(resource), 0);
        break;
      case 'normal':
        setTimeout(() => this.prefetchResource(resource), 100);
        break;
      case 'low':
        setTimeout(() => this.prefetchResource(resource), 500);
        break;
    }

    this.loadedResources.add(resource.url);
  }

  private preloadResource(resource: CriticalResource): void {
    const link = document.createElement('link');
    
    if (resource.preload || resource.priority === 'critical') {
      link.rel = 'preload';
      link.href = resource.url;
      
      if (resource.as) {
        link.as = resource.as;
      } else {
        // Auto-detect 'as' attribute based on resource type
        switch (resource.type) {
          case 'script':
            link.as = 'script';
            break;
          case 'style':
            link.as = 'style';
            break;
          case 'font':
            link.as = 'font';
            link.crossOrigin = resource.crossOrigin || 'anonymous';
            break;
          case 'image':
            link.as = 'image';
            break;
          case 'fetch':
            link.as = 'fetch';
            break;
        }
      }

      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }

      document.head.appendChild(link);
    }
  }

  private prefetchResource(resource: CriticalResource): void {
    if (resource.prefetch || resource.priority === 'low') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource.url;
      document.head.appendChild(link);
    }
  }

  /**
   * Get default critical resources for RentEasy
   */
  public static getDefaultCriticalResources(): CriticalResource[] {
    return [
      {
        type: 'style',
        url: '/css/critical.css',
        priority: 'critical',
        preload: true,
        as: 'style',
      },
      {
        type: 'font',
        url: '/fonts/Inter-Regular.woff2',
        priority: 'critical',
        preload: true,
        as: 'font',
        crossOrigin: 'anonymous',
      },
      {
        type: 'font',
        url: '/fonts/Inter-SemiBold.woff2',
        priority: 'high',
        preload: true,
        as: 'font',
        crossOrigin: 'anonymous',
      },
      {
        type: 'script',
        url: '/js/core.js',
        priority: 'high',
        preload: true,
        as: 'script',
      },
    ];
  }
}

// ============================================================================
// PERFORMANCE BUDGET MONITORING
// ============================================================================

interface PerformanceBudget {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  totalBlockingTime: number; // Total Blocking Time (ms)
  speedIndex: number; // Speed Index (ms)
}

/**
 * Monitor performance against SEO budgets
 */
export class PerformanceBudgetMonitor {
  private budget: PerformanceBudget;
  private violations: string[] = [];

  constructor(budget?: Partial<PerformanceBudget>) {
    // Default SEO-focused performance budget
    this.budget = {
      lcp: 2500, // Google's "good" threshold
      fid: 100,  // Google's "good" threshold
      cls: 0.1,  // Google's "good" threshold
      fcp: 1800,
      ttfb: 600,
      totalBlockingTime: 200,
      speedIndex: 3000,
      ...budget,
    };
  }

  /**
   * Check current performance against budget
   */
  public async checkBudget(): Promise<{
    passed: boolean;
    violations: string[];
    metrics: Record<string, number>;
    recommendations: string[];
  }> {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return {
        passed: false,
        violations: ['Performance API not available'],
        metrics: {},
        recommendations: ['Performance monitoring requires browser support'],
      };
    }

    const metrics = await this.collectMetrics();
    const violations = this.checkViolations(metrics);
    const recommendations = this.generateRecommendations(violations, metrics);

    return {
      passed: violations.length === 0,
      violations,
      metrics,
      recommendations,
    };
  }

  private async collectMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          metrics.cls = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            metrics.fcp = fcpEntry.startTime;
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });

        // TTFB
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0];
          metrics.ttfb = navigation.responseStart - navigation.fetchStart;
        }

        // Wait a bit for metrics to be collected
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Failed to collect performance metrics:', error);
      }
    }

    return metrics;
  }

  private checkViolations(metrics: Record<string, number>): string[] {
    const violations: string[] = [];

    Object.entries(this.budget).forEach(([metric, budget]) => {
      const actualValue = metrics[metric];
      if (actualValue !== undefined && actualValue > budget) {
        violations.push(`${metric}: ${actualValue.toFixed(2)} > ${budget} (budget exceeded)`);
      }
    });

    return violations;
  }

  private generateRecommendations(violations: string[], metrics: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.includes('lcp'))) {
      recommendations.push('Optimize Largest Contentful Paint: compress images, minimize render-blocking resources');
    }

    if (violations.some(v => v.includes('fid'))) {
      recommendations.push('Reduce First Input Delay: minimize JavaScript execution time, code splitting');
    }

    if (violations.some(v => v.includes('cls'))) {
      recommendations.push('Improve Cumulative Layout Shift: specify image dimensions, avoid dynamic content insertion');
    }

    if (violations.some(v => v.includes('fcp'))) {
      recommendations.push('Improve First Contentful Paint: optimize critical resources, reduce server response times');
    }

    if (violations.some(v => v.includes('ttfb'))) {
      recommendations.push('Reduce Time to First Byte: optimize server performance, use CDN, enable compression');
    }

    return recommendations;
  }
}

// Export utilities
export { ProgressiveContentLoader, createSEOLazyLoader, CriticalResourceManager, PerformanceBudgetMonitor };