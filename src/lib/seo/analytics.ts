/**
 * SEO Analytics and Monitoring System - RentEasy
 * 
 * Comprehensive SEO monitoring utilities for performance tracking,
 * validation, and optimization recommendations.
 * 
 * Features:
 * - Core Web Vitals monitoring
 * - Structured data validation
 * - SEO health checks
 * - Performance metrics tracking
 * - Google Search Console API integration (preparation)
 * - Real-time SEO auditing
 */

import type {
  SEOMetrics,
  SEOAuditResult,
  SEORecommendation,
  CrawlabilityMetrics,
  IndexabilityMetrics,
  PerformanceMetrics,
  ContentQualityMetrics,
  TechnicalSEOMetrics,
  UserExperienceMetrics,
  StructuredData,
} from '@/lib/types/seo';

// ============================================================================
// CORE WEB VITALS MONITORING
// ============================================================================

interface CoreWebVitalsData {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

/**
 * Monitor Core Web Vitals using Performance Observer API
 */
export class CoreWebVitalsMonitor {
  private metrics: Partial<CoreWebVitalsData> = {};
  private observers: PerformanceObserver[] = [];

  constructor(private onMetricUpdate?: (metric: string, value: number) => void) {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      this.updateMetric('lcp', lastEntry.startTime);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0] as PerformanceEntry & {
        processingStart: number;
        startTime: number;
      };
      const fid = firstInput.processingStart - firstInput.startTime;
      this.updateMetric('fid', fid);
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric('layout-shift', (entries) => {
      for (const entry of entries as PerformanceEntry[] & Array<{ value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.updateMetric('cls', clsValue);
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.updateMetric('fcp', fcpEntry.startTime);
      }
    });

    // Time to First Byte (TTFB)
    this.observeNavigation();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type} metric:`, error);
    }
  }

  private observeNavigation(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const [navigation] = list.getEntries() as PerformanceNavigationTiming[];
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.fetchStart;
          this.updateMetric('ttfb', ttfb);
        }
      });
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe navigation timing:', error);
    }
  }

  private updateMetric(metric: keyof CoreWebVitalsData, value: number): void {
    this.metrics[metric] = value;
    this.onMetricUpdate?.(metric, value);
  }

  public getMetrics(): Partial<CoreWebVitalsData> {
    return { ...this.metrics };
  }

  public getCoreWebVitalsScore(): number {
    const { lcp, fid, cls } = this.metrics;
    
    if (!lcp || !fid || cls === undefined) return 0;

    // Google's thresholds for "good" Core Web Vitals
    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0;
    const fidScore = fid <= 100 ? 100 : fid <= 300 ? 50 : 0;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// ============================================================================
// SEO HEALTH CHECKER
// ============================================================================

interface SEOHealthCheck {
  title: string;
  description: string;
  passed: boolean;
  score: number;
  recommendation?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Comprehensive SEO health checker for pages
 */
export class SEOHealthChecker {
  private document: Document;
  private url: string;

  constructor(doc?: Document, currentUrl?: string) {
    this.document = doc || (typeof window !== 'undefined' ? window.document : {} as Document);
    this.url = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
  }

  public async runHealthCheck(): Promise<SEOHealthCheck[]> {
    const checks: SEOHealthCheck[] = [];

    // Title tag checks
    checks.push(this.checkTitleTag());
    checks.push(this.checkTitleLength());
    
    // Meta description checks
    checks.push(this.checkMetaDescription());
    checks.push(this.checkMetaDescriptionLength());
    
    // Heading structure
    checks.push(this.checkH1Tag());
    checks.push(this.checkHeadingStructure());
    
    // Image optimization
    checks.push(this.checkImageAltTags());
    checks.push(this.checkImageOptimization());
    
    // Link structure
    checks.push(this.checkInternalLinks());
    checks.push(this.checkExternalLinks());
    
    // Technical SEO
    checks.push(this.checkCanonicalTag());
    checks.push(this.checkMetaRobots());
    checks.push(this.checkStructuredData());
    checks.push(this.checkOpenGraphTags());
    checks.push(this.checkTwitterCardTags());
    
    // Performance checks
    if (typeof window !== 'undefined') {
      checks.push(await this.checkPageLoadSpeed());
    }

    return checks;
  }

  private checkTitleTag(): SEOHealthCheck {
    const title = this.document.querySelector('title')?.textContent;
    
    return {
      title: 'Title Tag Present',
      description: 'Page has a title tag',
      passed: !!title && title.trim().length > 0,
      score: title && title.trim().length > 0 ? 100 : 0,
      recommendation: !title ? 'Add a descriptive title tag to your page' : undefined,
      priority: 'critical',
    };
  }

  private checkTitleLength(): SEOHealthCheck {
    const title = this.document.querySelector('title')?.textContent || '';
    const length = title.length;
    const isOptimal = length >= 30 && length <= 60;
    
    return {
      title: 'Title Length Optimization',
      description: `Title is ${length} characters (optimal: 30-60)`,
      passed: isOptimal,
      score: isOptimal ? 100 : length > 0 ? 50 : 0,
      recommendation: length < 30 
        ? 'Consider making your title longer for better SEO'
        : length > 60
        ? 'Consider shortening your title to prevent truncation in search results'
        : undefined,
      priority: 'high',
    };
  }

  private checkMetaDescription(): SEOHealthCheck {
    const metaDesc = this.document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    return {
      title: 'Meta Description Present',
      description: 'Page has a meta description',
      passed: !!metaDesc && metaDesc.trim().length > 0,
      score: metaDesc && metaDesc.trim().length > 0 ? 100 : 0,
      recommendation: !metaDesc ? 'Add a compelling meta description to improve click-through rates' : undefined,
      priority: 'critical',
    };
  }

  private checkMetaDescriptionLength(): SEOHealthCheck {
    const metaDesc = this.document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const length = metaDesc.length;
    const isOptimal = length >= 120 && length <= 160;
    
    return {
      title: 'Meta Description Length',
      description: `Meta description is ${length} characters (optimal: 120-160)`,
      passed: isOptimal,
      score: isOptimal ? 100 : length > 0 ? 50 : 0,
      recommendation: length < 120 
        ? 'Consider expanding your meta description for better SERP real estate'
        : length > 160
        ? 'Consider shortening your meta description to prevent truncation'
        : undefined,
      priority: 'high',
    };
  }

  private checkH1Tag(): SEOHealthCheck {
    const h1Elements = this.document.querySelectorAll('h1');
    const hasH1 = h1Elements.length > 0;
    const hasMultipleH1 = h1Elements.length > 1;
    
    return {
      title: 'H1 Tag Structure',
      description: `Page has ${h1Elements.length} H1 tag(s)`,
      passed: hasH1 && !hasMultipleH1,
      score: hasH1 && !hasMultipleH1 ? 100 : hasH1 ? 75 : 0,
      recommendation: !hasH1 
        ? 'Add an H1 tag to clearly define your page topic'
        : hasMultipleH1
        ? 'Use only one H1 tag per page for better SEO'
        : undefined,
      priority: 'high',
    };
  }

  private checkHeadingStructure(): SEOHealthCheck {
    const headings = this.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    let structureScore = 100;
    let hasIssue = false;
    
    // Check for proper hierarchical structure
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        structureScore -= 20;
        hasIssue = true;
      }
    }
    
    return {
      title: 'Heading Structure',
      description: `Page has ${headings.length} heading elements`,
      passed: !hasIssue && headings.length >= 2,
      score: Math.max(0, structureScore),
      recommendation: hasIssue 
        ? 'Ensure headings follow a logical hierarchy (H1 > H2 > H3, etc.)'
        : headings.length < 2
        ? 'Consider adding more headings to improve content structure'
        : undefined,
      priority: 'medium',
    };
  }

  private checkImageAltTags(): SEOHealthCheck {
    const images = this.document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt'));
    const altCoverage = images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100;
    
    return {
      title: 'Image Alt Tags',
      description: `${imagesWithAlt.length}/${images.length} images have alt text`,
      passed: altCoverage === 100,
      score: Math.round(altCoverage),
      recommendation: altCoverage < 100 
        ? 'Add descriptive alt text to all images for better accessibility and SEO'
        : undefined,
      priority: 'high',
    };
  }

  private checkImageOptimization(): SEOHealthCheck {
    const images = this.document.querySelectorAll('img');
    const modernFormatImages = Array.from(images).filter(img => {
      const src = img.src || img.getAttribute('data-src') || '';
      return src.includes('.webp') || src.includes('.avif');
    });
    
    const optimizationScore = images.length > 0 ? (modernFormatImages.length / images.length) * 100 : 100;
    
    return {
      title: 'Image Format Optimization',
      description: `${modernFormatImages.length}/${images.length} images use modern formats`,
      passed: optimizationScore >= 75,
      score: Math.round(optimizationScore),
      recommendation: optimizationScore < 75 
        ? 'Consider using WebP or AVIF formats for better performance'
        : undefined,
      priority: 'medium',
    };
  }

  private checkInternalLinks(): SEOHealthCheck {
    const allLinks = this.document.querySelectorAll('a[href]');
    const internalLinks = Array.from(allLinks).filter(link => {
      const href = link.getAttribute('href') || '';
      return href.startsWith('/') || href.includes(window.location.hostname);
    });
    
    return {
      title: 'Internal Linking',
      description: `Page has ${internalLinks.length} internal links`,
      passed: internalLinks.length >= 3,
      score: Math.min(100, internalLinks.length * 10),
      recommendation: internalLinks.length < 3 
        ? 'Add more internal links to improve site navigation and SEO'
        : undefined,
      priority: 'medium',
    };
  }

  private checkExternalLinks(): SEOHealthCheck {
    const allLinks = this.document.querySelectorAll('a[href]');
    const externalLinks = Array.from(allLinks).filter(link => {
      const href = link.getAttribute('href') || '';
      return href.startsWith('http') && !href.includes(window.location.hostname);
    });
    
    const linksWithNofollow = Array.from(externalLinks).filter(link => 
      link.getAttribute('rel')?.includes('nofollow')
    );
    
    const properRelScore = externalLinks.length > 0 ? (linksWithNofollow.length / externalLinks.length) * 100 : 100;
    
    return {
      title: 'External Link Management',
      description: `${linksWithNofollow.length}/${externalLinks.length} external links have proper rel attributes`,
      passed: properRelScore >= 80,
      score: Math.round(properRelScore),
      recommendation: properRelScore < 80 
        ? 'Consider adding rel="nofollow" or rel="noopener" to external links'
        : undefined,
      priority: 'low',
    };
  }

  private checkCanonicalTag(): SEOHealthCheck {
    const canonical = this.document.querySelector('link[rel="canonical"]');
    const hasCanonical = !!canonical;
    const href = canonical?.getAttribute('href');
    
    return {
      title: 'Canonical URL',
      description: hasCanonical ? `Canonical URL: ${href}` : 'No canonical URL found',
      passed: hasCanonical,
      score: hasCanonical ? 100 : 0,
      recommendation: !hasCanonical 
        ? 'Add a canonical URL to prevent duplicate content issues'
        : undefined,
      priority: 'high',
    };
  }

  private checkMetaRobots(): SEOHealthCheck {
    const robotsMeta = this.document.querySelector('meta[name="robots"]');
    const content = robotsMeta?.getAttribute('content') || '';
    const isIndexable = !content.includes('noindex');
    
    return {
      title: 'Meta Robots Tag',
      description: robotsMeta ? `Robots directive: ${content}` : 'No robots meta tag (default: index, follow)',
      passed: isIndexable,
      score: isIndexable ? 100 : 0,
      recommendation: !isIndexable 
        ? 'Page is set to noindex - ensure this is intentional'
        : undefined,
      priority: 'critical',
    };
  }

  private checkStructuredData(): SEOHealthCheck {
    const structuredDataScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    const hasStructuredData = structuredDataScripts.length > 0;
    
    let validStructuredData = 0;
    structuredDataScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@context'] && data['@type']) {
          validStructuredData++;
        }
      } catch (e) {
        // Invalid JSON
      }
    });
    
    return {
      title: 'Structured Data',
      description: `${validStructuredData}/${structuredDataScripts.length} valid structured data blocks`,
      passed: validStructuredData > 0,
      score: validStructuredData > 0 ? Math.min(100, validStructuredData * 25) : 0,
      recommendation: validStructuredData === 0 
        ? 'Add structured data markup to enhance search result visibility'
        : undefined,
      priority: 'medium',
    };
  }

  private checkOpenGraphTags(): SEOHealthCheck {
    const ogTags = this.document.querySelectorAll('meta[property^="og:"]');
    const essentialOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const presentTags = Array.from(ogTags).map(tag => tag.getAttribute('property'));
    
    const coverage = essentialOgTags.filter(tag => presentTags.includes(tag)).length;
    const coveragePercent = (coverage / essentialOgTags.length) * 100;
    
    return {
      title: 'OpenGraph Tags',
      description: `${coverage}/${essentialOgTags.length} essential OG tags present`,
      passed: coverage === essentialOgTags.length,
      score: Math.round(coveragePercent),
      recommendation: coverage < essentialOgTags.length 
        ? 'Add missing OpenGraph tags for better social media sharing'
        : undefined,
      priority: 'medium',
    };
  }

  private checkTwitterCardTags(): SEOHealthCheck {
    const twitterTags = this.document.querySelectorAll('meta[name^="twitter:"]');
    const essentialTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const presentTags = Array.from(twitterTags).map(tag => tag.getAttribute('name'));
    
    const coverage = essentialTwitterTags.filter(tag => presentTags.includes(tag)).length;
    const coveragePercent = (coverage / essentialTwitterTags.length) * 100;
    
    return {
      title: 'Twitter Card Tags',
      description: `${coverage}/${essentialTwitterTags.length} essential Twitter tags present`,
      passed: coverage === essentialTwitterTags.length,
      score: Math.round(coveragePercent),
      recommendation: coverage < essentialTwitterTags.length 
        ? 'Add missing Twitter Card tags for better Twitter sharing'
        : undefined,
      priority: 'low',
    };
  }

  private async checkPageLoadSpeed(): Promise<SEOHealthCheck> {
    return new Promise((resolve) => {
      if ('performance' in window && 'timing' in window.performance) {
        window.addEventListener('load', () => {
          const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
          const score = loadTime < 3000 ? 100 : loadTime < 5000 ? 75 : loadTime < 8000 ? 50 : 25;
          
          resolve({
            title: 'Page Load Speed',
            description: `Page loaded in ${(loadTime / 1000).toFixed(2)} seconds`,
            passed: loadTime < 3000,
            score,
            recommendation: loadTime >= 3000 
              ? 'Optimize images, minimize JS/CSS, and enable compression to improve load speed'
              : undefined,
            priority: 'high',
          });
        });
      } else {
        resolve({
          title: 'Page Load Speed',
          description: 'Performance timing not available',
          passed: false,
          score: 0,
          recommendation: 'Performance timing API not supported',
          priority: 'high',
        });
      }
    });
  }
}

// ============================================================================
// SEO AUDIT SYSTEM
// ============================================================================

/**
 * Complete SEO audit system combining all monitoring tools
 */
export class SEOAuditor {
  private cwvMonitor: CoreWebVitalsMonitor;
  private healthChecker: SEOHealthChecker;

  constructor() {
    this.cwvMonitor = new CoreWebVitalsMonitor();
    this.healthChecker = new SEOHealthChecker();
  }

  public async runComprehensiveAudit(): Promise<SEOAuditResult> {
    const healthChecks = await this.healthChecker.runHealthCheck();
    const cwvMetrics = this.cwvMonitor.getMetrics();
    const cwvScore = this.cwvMonitor.getCoreWebVitalsScore();

    const overallScore = this.calculateOverallScore(healthChecks, cwvScore);
    const recommendations = this.generateRecommendations(healthChecks);

    return {
      score: overallScore,
      grade: this.getGradeFromScore(overallScore),
      recommendations,
      metrics: this.buildMetricsObject(healthChecks, cwvMetrics),
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      version: '1.0.0',
    };
  }

  private calculateOverallScore(healthChecks: SEOHealthCheck[], cwvScore: number): number {
    const healthScore = healthChecks.reduce((total, check) => total + check.score, 0) / healthChecks.length;
    return Math.round((healthScore * 0.7) + (cwvScore * 0.3));
  }

  private getGradeFromScore(score: number): SEOAuditResult['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(healthChecks: SEOHealthCheck[]): SEORecommendation[] {
    return healthChecks
      .filter(check => !check.passed && check.recommendation)
      .map(check => ({
        type: check.score === 0 ? 'error' : 'improvement' as const,
        priority: check.priority,
        title: check.title,
        description: check.recommendation!,
        impact: check.priority === 'critical' ? 'high' : check.priority === 'high' ? 'medium' : 'low' as const,
        effort: 'medium' as const,
        category: this.categorizeRecommendation(check.title),
        actionItems: [check.recommendation!],
      }));
  }

  private categorizeRecommendation(title: string): SEORecommendation['category'] {
    if (title.includes('Speed') || title.includes('Performance')) return 'performance';
    if (title.includes('Image') || title.includes('Optimization')) return 'technical';
    if (title.includes('Title') || title.includes('Description') || title.includes('Content')) return 'content';
    if (title.includes('Mobile') || title.includes('Responsive')) return 'mobile';
    return 'technical';
  }

  private buildMetricsObject(healthChecks: SEOHealthCheck[], cwvMetrics: Partial<CoreWebVitalsData>): SEOMetrics {
    return {
      crawlability: {
        robotsTxtValid: true, // Would need actual robots.txt validation
        sitemapValid: true, // Would need actual sitemap validation
        crawlErrors: 0,
        blockedResources: 0,
        crawlDepth: 3, // Estimated
        internalLinks: this.getHealthCheckScore(healthChecks, 'Internal Linking'),
        externalLinks: this.getHealthCheckScore(healthChecks, 'External Link Management'),
      },
      indexability: {
        indexedPages: 1,
        totalPages: 1,
        indexationRate: 100,
        duplicateContent: 0,
        canonicalIssues: this.getHealthCheckScore(healthChecks, 'Canonical URL') < 100 ? 1 : 0,
        metaNoindexPages: this.getHealthCheckScore(healthChecks, 'Meta Robots Tag') < 100 ? 1 : 0,
      },
      performance: {
        pageLoadTime: 0, // Would need actual measurement
        firstContentfulPaint: cwvMetrics.fcp || 0,
        largestContentfulPaint: cwvMetrics.lcp || 0,
        cumulativeLayoutShift: cwvMetrics.cls || 0,
        firstInputDelay: cwvMetrics.fid || 0,
        coreWebVitalsScore: this.cwvMonitor.getCoreWebVitalsScore(),
      },
      contentQuality: {
        averageWordCount: 0, // Would need content analysis
        readabilityScore: 0, // Would need readability analysis
        headingStructureScore: this.getHealthCheckScore(healthChecks, 'Heading Structure'),
        imageOptimizationScore: this.getHealthCheckScore(healthChecks, 'Image Alt Tags'),
        keywordDensity: {},
        contentFreshness: 0,
      },
      technicalSEO: {
        htmlValidationErrors: 0,
        structuredDataErrors: this.getHealthCheckScore(healthChecks, 'Structured Data') < 100 ? 1 : 0,
        mobileUsabilityScore: 100, // Would need actual mobile testing
        httpsImplementation: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
        breadcrumbsImplemented: false, // Would need breadcrumb detection
        schemaMarkupCoverage: this.getHealthCheckScore(healthChecks, 'Structured Data'),
      },
      userExperience: {
        bounceRate: 0, // Would need analytics integration
        averageSessionDuration: 0, // Would need analytics integration
        pageViews: 0, // Would need analytics integration
        conversionRate: 0, // Would need analytics integration
        mobileTraffic: 0, // Would need analytics integration
        userSatisfactionScore: 0, // Would need user feedback
      },
    };
  }

  private getHealthCheckScore(healthChecks: SEOHealthCheck[], title: string): number {
    const check = healthChecks.find(hc => hc.title === title);
    return check?.score || 0;
  }

  public disconnect(): void {
    this.cwvMonitor.disconnect();
  }
}

// ============================================================================
// GOOGLE SEARCH CONSOLE API INTEGRATION (PREPARATION)
// ============================================================================

/**
 * Google Search Console API client preparation
 * (Requires API key and authentication setup)
 */
export class SearchConsoleIntegration {
  constructor(private apiKey: string, private siteUrl: string) {}

  // Placeholder methods for future implementation
  public async getSearchAnalytics(startDate: string, endDate: string) {
    // Would implement actual GSC API calls
    console.log('GSC API integration not yet implemented');
    return null;
  }

  public async getIndexingStatus() {
    // Would implement actual GSC API calls
    console.log('GSC API integration not yet implemented');
    return null;
  }

  public async getCrawlErrors() {
    // Would implement actual GSC API calls
    console.log('GSC API integration not yet implemented');
    return null;
  }
}

// Export monitoring utilities
export { CoreWebVitalsMonitor, SEOHealthChecker, SEOAuditor, SearchConsoleIntegration };