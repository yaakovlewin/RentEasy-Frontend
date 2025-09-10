/**
 * Social Share Optimizer - RentEasy
 * 
 * Advanced social sharing component with optimized metadata for all major platforms.
 * Includes dynamic OpenGraph image generation and platform-specific optimizations.
 * 
 * Features:
 * - Platform-specific sharing optimization
 * - Dynamic OpenGraph image generation
 * - Share tracking and analytics
 * - Customizable share buttons
 * - Copy-to-clipboard functionality
 * - Native share API support
 * - SEO-optimized sharing metadata
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Copy, 
  Check,
  Mail,
  Send
} from 'lucide-react';
// import { generateOpenGraphImageUrl } from '@/app/opengraph-image'; // Removed due to build issues
import { cn } from '@/lib/utils';

interface SocialShareData {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  hashtags?: string[];
  via?: string; // Twitter via parameter
  type?: 'homepage' | 'property' | 'search' | 'profile' | 'generic';
  propertyData?: {
    location?: string;
    price?: string;
    currency?: string;
    rating?: number;
    propertyType?: string;
  };
}

interface SocialShareOptimizerProps {
  data?: SocialShareData;
  platforms?: SharePlatform[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onShare?: (platform: string, success: boolean) => void;
}

type SharePlatform = 
  | 'facebook' 
  | 'twitter' 
  | 'linkedin' 
  | 'whatsapp' 
  | 'email' 
  | 'telegram' 
  | 'copy' 
  | 'native';

const DEFAULT_PLATFORMS: SharePlatform[] = [
  'facebook',
  'twitter',
  'linkedin',
  'whatsapp',
  'email',
  'copy',
  'native',
];

/**
 * Social Share Optimizer Component
 */
export const SocialShareOptimizer: React.FC<SocialShareOptimizerProps> = ({
  data,
  platforms = DEFAULT_PLATFORMS,
  showLabels = false,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  className,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // If no data is provided, return null (don't render)
  if (!data) {
    return null;
  }

  // Generate optimized OpenGraph image URL (temporarily disabled)
  const optimizedImageUrl = data.imageUrl || '/images/og-fallback.png';

  // Handle share actions
  const handleShare = useCallback(async (platform: SharePlatform) => {
    setSharing(true);
    let success = false;

    try {
      switch (platform) {
        case 'facebook':
          success = await shareFacebook();
          break;
        case 'twitter':
          success = await shareTwitter();
          break;
        case 'linkedin':
          success = await shareLinkedIn();
          break;
        case 'whatsapp':
          success = await shareWhatsApp();
          break;
        case 'email':
          success = await shareEmail();
          break;
        case 'telegram':
          success = await shareTelegram();
          break;
        case 'copy':
          success = await copyToClipboard();
          break;
        case 'native':
          success = await shareNative();
          break;
      }

      onShare?.(platform, success);

      // Analytics tracking
      if (success && typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'share', {
          method: platform,
          content_type: data.type || 'page',
          item_id: data.url,
        });
      }
    } catch (error) {
      console.error(`Failed to share via ${platform}:`, error);
      success = false;
    } finally {
      setSharing(false);
    }

    return success;
  }, [data, onShare]);

  // Platform-specific share functions
  const shareFacebook = async (): Promise<boolean> => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  };

  const shareTwitter = async (): Promise<boolean> => {
    const text = `${data.title} ${data.hashtags?.map(tag => `#${tag}`).join(' ') || ''}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}${data.via ? `&via=${data.via}` : ''}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  };

  const shareLinkedIn = async (): Promise<boolean> => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  };

  const shareWhatsApp = async (): Promise<boolean> => {
    const text = `${data.title}\n${data.description}\n${data.url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    return true;
  };

  const shareEmail = async (): Promise<boolean> => {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.description}\n\n${data.url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    return true;
  };

  const shareTelegram = async (): Promise<boolean> => {
    const text = `${data.title}\n${data.description}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    return true;
  };

  const copyToClipboard = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = data.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    }
  };

  const shareNative = async (): Promise<boolean> => {
    if (!navigator.share) return false;

    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  };

  // Platform configurations
  const platformConfigs = {
    facebook: {
      icon: Facebook,
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      outlineColor: 'border-blue-600 text-blue-600 hover:bg-blue-600',
    },
    twitter: {
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      outlineColor: 'border-sky-500 text-sky-500 hover:bg-sky-500',
    },
    linkedin: {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800',
      outlineColor: 'border-blue-700 text-blue-700 hover:bg-blue-700',
    },
    whatsapp: {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-600 hover:bg-green-700',
      outlineColor: 'border-green-600 text-green-600 hover:bg-green-600',
    },
    email: {
      icon: Mail,
      label: 'Email',
      color: 'bg-gray-600 hover:bg-gray-700',
      outlineColor: 'border-gray-600 text-gray-600 hover:bg-gray-600',
    },
    telegram: {
      icon: Send,
      label: 'Telegram',
      color: 'bg-blue-500 hover:bg-blue-600',
      outlineColor: 'border-blue-500 text-blue-500 hover:bg-blue-500',
    },
    copy: {
      icon: copied ? Check : Copy,
      label: copied ? 'Copied!' : 'Copy Link',
      color: copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700',
      outlineColor: copied 
        ? 'border-green-600 text-green-600' 
        : 'border-gray-600 text-gray-600 hover:bg-gray-600',
    },
    native: {
      icon: Share2,
      label: 'Share',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      outlineColor: 'border-indigo-600 text-indigo-600 hover:bg-indigo-600',
    },
  };

  // Size configurations
  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Filter platforms based on availability
  const availablePlatforms = platforms.filter(platform => {
    if (platform === 'native') {
      return typeof navigator !== 'undefined' && navigator.share;
    }
    return true;
  });

  return (
    <div
      className={cn(
        'flex gap-2',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {availablePlatforms.map((platform) => {
        const config = platformConfigs[platform];
        const Icon = config.icon;

        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            disabled={sharing}
            className={cn(
              'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              variant === 'default' && `text-white ${config.color}`,
              variant === 'outline' && `border ${config.outlineColor} hover:text-white`,
              variant === 'ghost' && `${config.outlineColor.replace('border-', 'text-').replace('hover:bg-', 'hover:bg-').replace(/text-\w+-\d+/, 'hover:text-white')} hover:bg-opacity-10`,
              showLabels ? 'gap-2' : '',
            )}
            title={config.label}
            aria-label={`Share via ${config.label}`}
          >
            <Icon className={iconSizes[size]} />
            {showLabels && (
              <span className="whitespace-nowrap">{config.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Hook to generate social share data from page context
 */
export const useSocialShareData = (
  baseData: Partial<SocialShareData> = {},
  pathname?: string
): SocialShareData => {
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com'}${pathname || ''}`;

  return {
    url: currentUrl,
    title: 'RentEasy - Premium Vacation Rentals',
    description: 'Discover unique vacation rentals around the world',
    hashtags: ['VacationRentals', 'Travel', 'RentEasy'],
    via: 'RentEasy',
    type: 'generic',
    ...baseData,
  };
};

/**
 * Optimized social sharing metadata injection
 */
export const injectSocialMetadata = (data: SocialShareData): void => {
  if (typeof document === 'undefined') return;

  // Update existing meta tags or create new ones
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // OpenGraph tags
  updateMetaTag('og:url', data.url);
  updateMetaTag('og:title', data.title);
  updateMetaTag('og:description', data.description);
  updateMetaTag('og:type', data.type === 'property' ? 'product' : 'website');
  
  if (data.imageUrl) {
    updateMetaTag('og:image', data.imageUrl);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', data.title);
  updateMetaTag('twitter:description', data.description);
  
  if (data.imageUrl) {
    updateMetaTag('twitter:image', data.imageUrl);
  }
  
  if (data.via) {
    updateMetaTag('twitter:site', `@${data.via}`);
  }
};

export default SocialShareOptimizer;