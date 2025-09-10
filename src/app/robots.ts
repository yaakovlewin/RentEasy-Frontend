/**
 * Dynamic Robots.txt Configuration - RentEasy
 * 
 * Enterprise-grade robots.txt generation with environment-specific rules,
 * comprehensive crawling directives, and security-conscious configurations.
 * 
 * Features:
 * - Environment-specific crawling rules (dev vs production)
 * - Security-conscious disallow patterns
 * - Dynamic sitemap URL generation
 * - Rate limiting suggestions for crawlers
 * - Support for multiple user agents
 */

import { MetadataRoute } from 'next';

interface RobotsConfig {
  rules: MetadataRoute.Robots['rules'];
  sitemap?: string | string[];
  host?: string;
}

/**
 * Get environment-specific robots configuration
 */
function getRobotsConfig(): RobotsConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Development environment - restrict all crawling
  if (isDevelopment) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      host: baseUrl,
    };
  }

  // Production environment - comprehensive crawling rules
  return {
    rules: [
      // Main crawlers - full access with restrictions
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        allow: '/',
        disallow: [
          // API endpoints
          '/api/',
          // Private areas
          '/dashboard/',
          '/admin/',
          // Authentication pages
          '/auth/login',
          '/auth/register',
          // System directories
          '/_next/',
          '/_vercel/',
          // Dynamic internal pages
          '/internal/',
          // Temporary and cache files
          '/temp/',
          '/cache/',
          // User-generated content that shouldn't be indexed
          '/uploads/temp/',
          // Search results with sensitive queries
          '/search?*private*',
          '/search?*admin*',
          // Error pages
          '/404',
          '/500',
          '/error',
          // Development and testing paths
          '/test/',
          '/dev/',
          // Sensitive business logic
          '/calculations/',
          '/analytics/raw/',
        ],
        crawlDelay: 1, // 1 second delay between requests
      },
      
      // Social media crawlers - limited access
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot'],
        allow: [
          '/',
          '/property/',
          '/search',
          '/about',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/_next/',
        ],
      },

      // Image crawlers - access to property images
      {
        userAgent: ['Googlebot-Image', 'Bingbot-Image'],
        allow: [
          '/images/',
          '/uploads/properties/',
          '/_next/image',
        ],
        disallow: [
          '/uploads/temp/',
          '/uploads/private/',
          '/api/',
        ],
      },

      // AI training bots - restricted access
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ChatGPT-Bot', 'CCBot', 'anthropic-ai'],
        disallow: '/',
      },

      // Aggressive crawlers - rate limited
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
        ],
        crawlDelay: 10, // 10 second delay for aggressive crawlers
      },

      // Spam and unwanted bots
      {
        userAgent: [
          'SurveyBot',
          'EmailCollector',
          'WebReaper',
          'WebCopier',
          'HTTrack',
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
        ],
        disallow: '/',
      },

      // Default fallback for unlisted crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/_next/',
          '/internal/',
          '/temp/',
        ],
        crawlDelay: 2, // Conservative crawl delay for unknown bots
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

/**
 * Generate robots.txt metadata route
 */
export default function robots(): MetadataRoute.Robots {
  const config = getRobotsConfig();
  
  const robots: MetadataRoute.Robots = {
    rules: config.rules,
  };

  // Add sitemap reference in production
  if (config.sitemap && process.env.NODE_ENV === 'production') {
    robots.sitemap = config.sitemap;
  }

  // Add host information
  if (config.host && process.env.NODE_ENV === 'production') {
    robots.host = config.host;
  }

  return robots;
}

/**
 * Export configuration for testing and debugging
 */
export { getRobotsConfig };

/**
 * Type definitions for robots configuration
 */
export interface CustomRobotsRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

export interface RobotsMetadata {
  rules: CustomRobotsRule[];
  sitemap?: string | string[];
  host?: string;
  lastModified?: Date;
}

/**
 * Utility functions for robots.txt management
 */
export class RobotsUtils {
  /**
   * Validate robots.txt configuration
   */
  static validateConfig(config: RobotsConfig): boolean {
    try {
      // Check if rules array exists and has content
      if (!config.rules || !Array.isArray(config.rules) || config.rules.length === 0) {
        console.error('Robots config must have rules array');
        return false;
      }

      // Validate each rule
      for (const rule of config.rules) {
        if (!rule.userAgent) {
          console.error('Each robots rule must have userAgent');
          return false;
        }
      }

      // Validate sitemap URL if provided
      if (config.sitemap) {
        const sitemaps = Array.isArray(config.sitemap) ? config.sitemap : [config.sitemap];
        for (const sitemap of sitemaps) {
          try {
            new URL(sitemap);
          } catch {
            console.error(`Invalid sitemap URL: ${sitemap}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating robots config:', error);
      return false;
    }
  }

  /**
   * Generate robots.txt content as string (for debugging)
   */
  static generateRobotsText(config: RobotsConfig): string {
    let content = '';

    for (const rule of config.rules) {
      const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
      
      for (const userAgent of userAgents) {
        content += `User-agent: ${userAgent}\n`;
        
        if (rule.allow) {
          const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
          for (const allow of allows) {
            content += `Allow: ${allow}\n`;
          }
        }
        
        if (rule.disallow) {
          const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
          for (const disallow of disallows) {
            content += `Disallow: ${disallow}\n`;
          }
        }
        
        if (rule.crawlDelay) {
          content += `Crawl-delay: ${rule.crawlDelay}\n`;
        }
        
        content += '\n';
      }
    }

    if (config.sitemap) {
      const sitemaps = Array.isArray(config.sitemap) ? config.sitemap : [config.sitemap];
      for (const sitemap of sitemaps) {
        content += `Sitemap: ${sitemap}\n`;
      }
    }

    if (config.host) {
      content += `Host: ${config.host}\n`;
    }

    return content;
  }

  /**
   * Check if a path should be crawled based on rules
   */
  static canCrawlPath(userAgent: string, path: string, config: RobotsConfig): boolean {
    // Find matching rule for user agent
    const matchingRule = config.rules.find(rule => {
      const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
      return agents.includes(userAgent) || agents.includes('*');
    });

    if (!matchingRule) return true;

    // Check disallow patterns
    if (matchingRule.disallow) {
      const disallows = Array.isArray(matchingRule.disallow) 
        ? matchingRule.disallow 
        : [matchingRule.disallow];
      
      for (const disallow of disallows) {
        if (path.startsWith(disallow)) {
          // Check if explicitly allowed
          if (matchingRule.allow) {
            const allows = Array.isArray(matchingRule.allow) 
              ? matchingRule.allow 
              : [matchingRule.allow];
            
            for (const allow of allows) {
              if (path.startsWith(allow)) {
                return true;
              }
            }
          }
          return false;
        }
      }
    }

    return true;
  }
}