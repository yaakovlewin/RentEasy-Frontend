/**
 * Progressive Web App Manifest - RentEasy
 * 
 * Enterprise-grade PWA manifest with comprehensive app metadata,
 * optimized for mobile experiences, app store deployment, and
 * cross-platform compatibility.
 * 
 * Features:
 * - Complete PWA specification compliance
 * - Multiple icon sizes and formats
 * - App store optimization
 * - Platform-specific configurations
 * - Comprehensive display and launch options
 * - Advanced PWA features (shortcuts, categories, screenshots)
 */

import { MetadataRoute } from 'next';

interface ManifestConfig {
  name: string;
  shortName: string;
  description: string;
  baseUrl: string;
  themeColor: string;
  backgroundColor: string;
  accentColor: string;
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl' | 'auto';
}

/**
 * Get manifest configuration based on environment
 */
function getManifestConfig(): ManifestConfig {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'RentEasy';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    name: appName,
    shortName: appName.length > 12 ? 'RentEasy' : appName,
    description: 'Premium holiday rental platform with personalized matching service. Find your perfect vacation rental with expert assistance.',
    baseUrl: baseUrl.replace(/\/$/, ''),
    themeColor: '#2563eb', // Primary blue
    backgroundColor: '#ffffff', // White background
    accentColor: '#1d4ed8', // Darker blue for accents
    categories: [
      'travel',
      'lifestyle', 
      'business',
      'productivity',
      'navigation',
      'social'
    ],
    lang: 'en',
    dir: 'ltr',
  };
}

/**
 * Generate comprehensive icon configurations
 */
function getIconConfigurations(baseUrl: string): MetadataRoute.Manifest['icons'] {
  const iconSizes = [
    // Standard web icons
    { size: 16, purpose: 'any' },
    { size: 32, purpose: 'any' },
    { size: 48, purpose: 'any' },
    { size: 72, purpose: 'any' },
    { size: 96, purpose: 'any' },
    { size: 128, purpose: 'any' },
    { size: 144, purpose: 'any' },
    { size: 152, purpose: 'any' },
    { size: 192, purpose: 'any' },
    { size: 256, purpose: 'any' },
    { size: 384, purpose: 'any' },
    { size: 512, purpose: 'any' },
    { size: 1024, purpose: 'any' },
    
    // Maskable icons for modern Android
    { size: 192, purpose: 'maskable' },
    { size: 512, purpose: 'maskable' },
    { size: 1024, purpose: 'maskable' },
    
    // Monochrome icons for different themes
    { size: 192, purpose: 'monochrome' },
    { size: 512, purpose: 'monochrome' },
  ];

  return iconSizes.map(({ size, purpose }) => {
    const purposeSuffix = purpose !== 'any' ? `-${purpose}` : '';
    
    return {
      src: `${baseUrl}/icons/icon-${size}x${size}${purposeSuffix}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: purpose as any,
    };
  });
}

/**
 * Generate app shortcuts for quick access
 */
function getAppShortcuts(baseUrl: string): MetadataRoute.Manifest['shortcuts'] {
  return [
    {
      name: 'Search Properties',
      short_name: 'Search',
      description: 'Find your perfect vacation rental',
      url: `${baseUrl}/search`,
      icons: [
        {
          src: `${baseUrl}/icons/shortcuts/search-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'My Bookings',
      short_name: 'Bookings',
      description: 'View and manage your bookings',
      url: `${baseUrl}/dashboard`,
      icons: [
        {
          src: `${baseUrl}/icons/shortcuts/bookings-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Become a Host',
      short_name: 'Host',
      description: 'List your property on RentEasy',
      url: `${baseUrl}/become-host`,
      icons: [
        {
          src: `${baseUrl}/icons/shortcuts/host-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Help & Support',
      short_name: 'Help',
      description: 'Get help and contact support',
      url: `${baseUrl}/help`,
      icons: [
        {
          src: `${baseUrl}/icons/shortcuts/help-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
  ];
}

/**
 * Generate screenshots for app stores
 */
function getScreenshots(baseUrl: string): MetadataRoute.Manifest['screenshots'] {
  return [
    // Mobile screenshots (9:16 aspect ratio)
    {
      src: `${baseUrl}/screenshots/mobile-home.png`,
      sizes: '390x844',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Home screen with featured properties and search',
    },
    {
      src: `${baseUrl}/screenshots/mobile-search.png`,
      sizes: '390x844', 
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Property search with filters and map view',
    },
    {
      src: `${baseUrl}/screenshots/mobile-property.png`,
      sizes: '390x844',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Property details with photos and booking',
    },
    {
      src: `${baseUrl}/screenshots/mobile-dashboard.png`,
      sizes: '390x844',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'User dashboard with bookings and preferences',
    },
    
    // Desktop screenshots (16:10 aspect ratio)
    {
      src: `${baseUrl}/screenshots/desktop-home.png`,
      sizes: '1920x1200',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Desktop home page with property grid',
    },
    {
      src: `${baseUrl}/screenshots/desktop-search.png`,
      sizes: '1920x1200',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Advanced search interface with interactive map',
    },
    {
      src: `${baseUrl}/screenshots/desktop-property.png`,
      sizes: '1920x1200',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Detailed property view with gallery and amenities',
    },
    {
      src: `${baseUrl}/screenshots/desktop-dashboard.png`,
      sizes: '1920x1200',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Comprehensive dashboard for hosts and guests',
    },
  ];
}

/**
 * Generate protocol handlers for deep linking
 */
function getProtocolHandlers(): MetadataRoute.Manifest['protocol_handlers'] {
  return [
    {
      protocol: 'web+renteasy',
      url: '/handle-protocol?url=%s',
    },
    {
      protocol: 'mailto',
      url: '/contact?email=%s',
    },
  ];
}

/**
 * Main manifest generation function
 */
export default function manifest(): MetadataRoute.Manifest {
  const config = getManifestConfig();
  
  const manifestData: MetadataRoute.Manifest = {
    // Basic app information
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    
    // URLs and navigation
    start_url: '/',
    scope: '/',
    id: `${config.baseUrl}/`,
    
    // Visual appearance
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: config.themeColor,
    background_color: config.backgroundColor,
    
    // Icons configuration
    icons: getIconConfigurations(config.baseUrl),
    
    // App shortcuts
    shortcuts: getAppShortcuts(config.baseUrl),
    
    // Screenshots for app stores
    screenshots: getScreenshots(config.baseUrl),
    
    // Categories for app stores
    categories: config.categories,
    
    // Language and text direction
    lang: config.lang,
    dir: config.dir,
    
    // Protocol handlers for deep linking
    protocol_handlers: getProtocolHandlers(),
    
    // Advanced PWA features
    display_override: ['window-controls-overlay', 'minimal-ui', 'standalone', 'browser'],
    
    // Launch configuration
    launch_handler: {
      client_mode: 'navigate-new',
    },
    
    // Edge sidebar configuration (for PWA-enabled browsers)
    edge_side_panel: {
      preferred_width: 400,
    },
    
    // Prefer related applications (set to false to promote PWA)
    prefer_related_applications: false,
    
    // Related applications (for app store listings)
    related_applications: [
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.renteasy.app',
        id: 'com.renteasy.app',
      },
      {
        platform: 'itunes',
        url: 'https://apps.apple.com/app/renteasy/id123456789',
        id: '123456789',
      },
    ],
  };

  return manifestData;
}

/**
 * Export configuration and utilities for testing
 */
export { getManifestConfig, getIconConfigurations, getAppShortcuts, getScreenshots };

/**
 * Manifest validation and utility functions
 */
export class ManifestUtils {
  /**
   * Validate manifest configuration
   */
  static validateManifest(manifest: MetadataRoute.Manifest): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!manifest.name || manifest.name.length === 0) {
      errors.push('Manifest name is required');
    }

    if (!manifest.short_name || manifest.short_name.length === 0) {
      errors.push('Manifest short_name is required');
    }

    if (manifest.short_name && manifest.short_name.length > 12) {
      warnings.push('short_name should be 12 characters or less for better display');
    }

    if (!manifest.start_url) {
      errors.push('start_url is required');
    }

    if (!manifest.display) {
      warnings.push('display mode should be specified');
    }

    // Icons validation
    if (!manifest.icons || manifest.icons.length === 0) {
      errors.push('At least one icon is required');
    } else {
      const has192 = manifest.icons.some(icon => icon.sizes?.includes('192x192'));
      const has512 = manifest.icons.some(icon => icon.sizes?.includes('512x512'));
      
      if (!has192) {
        warnings.push('Icon with size 192x192 is recommended');
      }
      
      if (!has512) {
        warnings.push('Icon with size 512x512 is recommended');
      }

      // Check for maskable icons
      const hasMaskable = manifest.icons.some(icon => 
        icon.purpose?.includes('maskable')
      );
      
      if (!hasMaskable) {
        warnings.push('Maskable icons are recommended for modern Android devices');
      }
    }

    // Color validation
    if (!manifest.theme_color) {
      warnings.push('theme_color is recommended for better visual integration');
    }

    if (!manifest.background_color) {
      warnings.push('background_color is recommended for smooth app launches');
    }

    // Screenshots validation
    if (!manifest.screenshots || manifest.screenshots.length === 0) {
      warnings.push('Screenshots are recommended for app store listings');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate icon file checklist
   */
  static getIconChecklist(baseUrl: string): Array<{
    src: string;
    size: string;
    purpose: string;
    required: boolean;
  }> {
    const icons = getIconConfigurations(baseUrl);
    
    return icons.map(icon => ({
      src: icon.src!,
      size: icon.sizes!,
      purpose: icon.purpose || 'any',
      required: ['192x192', '512x512'].includes(icon.sizes!) || icon.purpose === 'maskable',
    }));
  }

  /**
   * Generate manifest.json content as string
   */
  static generateManifestJson(manifest: MetadataRoute.Manifest): string {
    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Check PWA installation criteria
   */
  static checkPWAInstallability(manifest: MetadataRoute.Manifest): {
    installable: boolean;
    criteria: Array<{
      requirement: string;
      met: boolean;
      description: string;
    }>;
  } {
    const criteria = [
      {
        requirement: 'HTTPS or localhost',
        met: true, // Assumed - Next.js handles this
        description: 'App must be served over HTTPS in production',
      },
      {
        requirement: 'Web App Manifest',
        met: true,
        description: 'Valid manifest.json file is present',
      },
      {
        requirement: 'Service Worker',
        met: false, // Note: This would need to be implemented separately
        description: 'Service worker for offline functionality',
      },
      {
        requirement: 'Icons',
        met: !!(manifest.icons && manifest.icons.length > 0),
        description: 'At least one icon in the manifest',
      },
      {
        requirement: 'Display mode',
        met: !!(manifest.display && manifest.display !== 'browser'),
        description: 'Display mode set to standalone, minimal-ui, or fullscreen',
      },
      {
        requirement: 'Start URL',
        met: !!manifest.start_url,
        description: 'Valid start_url specified',
      },
    ];

    const installable = criteria.every(criterion => criterion.met);

    return { installable, criteria };
  }

  /**
   * Generate app store metadata
   */
  static generateAppStoreMetadata(config: ManifestConfig): {
    googlePlay: Record<string, any>;
    appleAppStore: Record<string, any>;
    microsoftStore: Record<string, any>;
  } {
    return {
      googlePlay: {
        title: config.name,
        shortDescription: config.description.substring(0, 80),
        fullDescription: config.description,
        category: 'TRAVEL_AND_LOCAL',
        contentRating: 'Everyone',
        keywords: ['travel', 'vacation', 'rental', 'holiday', 'accommodation'],
        featureGraphic: `${config.baseUrl}/store-assets/feature-graphic.png`,
        screenshots: {
          phone: Array.from({ length: 8 }, (_, i) => 
            `${config.baseUrl}/store-assets/android-phone-${i + 1}.png`
          ),
          tablet: Array.from({ length: 4 }, (_, i) => 
            `${config.baseUrl}/store-assets/android-tablet-${i + 1}.png`
          ),
        },
      },
      appleAppStore: {
        name: config.name,
        subtitle: 'Premium Vacation Rentals',
        description: config.description,
        keywords: 'travel,vacation,rental,holiday,accommodation,booking',
        primaryCategory: 'Travel',
        secondaryCategory: 'Lifestyle',
        screenshots: {
          iPhone: Array.from({ length: 6 }, (_, i) => 
            `${config.baseUrl}/store-assets/ios-iphone-${i + 1}.png`
          ),
          iPad: Array.from({ length: 4 }, (_, i) => 
            `${config.baseUrl}/store-assets/ios-ipad-${i + 1}.png`
          ),
        },
      },
      microsoftStore: {
        displayName: config.name,
        description: config.description,
        category: 'Travel',
        screenshots: Array.from({ length: 4 }, (_, i) => 
          `${config.baseUrl}/store-assets/windows-${i + 1}.png`
        ),
      },
    };
  }
}