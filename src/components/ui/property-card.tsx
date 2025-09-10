'use client';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Award,
  Bookmark,
  Calendar,
  Car,
  Coffee,
  Eye,
  Heart,
  MapPin,
  Play,
  Pool,
  Share,
  Sparkles,
  Star,
  Users,
  Wifi,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Card, CardContent } from './card';

interface PropertyCardProps {
  id: string | number;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  badge?: string;
  isFeatured?: boolean;
  discount?: number;
  isVerified?: boolean;
  host?: {
    name: string;
    avatar: string;
    isSuperhost?: boolean;
  };
  className?: string;
  variant?: 'default' | 'premium' | 'luxury' | 'compact';
  onFavorite?: (id: string | number) => void;
  onShare?: (id: string | number) => void;
  isFavorited?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  price,
  originalPrice,
  rating,
  reviews,
  images,
  amenities,
  badge,
  isFeatured = false,
  discount,
  isVerified = true,
  host,
  className,
  variant = 'default',
  onFavorite,
  onShare,
  isFavorited = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Auto-cycle images on hover
  React.useEffect(() => {
    if (isHovered && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isHovered, images.length]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(id);
  };

  const getBadgeStyle = (badgeText: string) => {
    const badgeStyles = {
      Superhost: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
      'Rare Find': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      Luxury: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
      Premium: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
      Unique: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      Featured: 'bg-gradient-to-r from-primary to-pink-500 text-white',
    };
    return badgeStyles[badgeText as keyof typeof badgeStyles] || 'bg-gray-800 text-white';
  };

  const variantStyles = {
    default: 'max-w-sm',
    premium: 'max-w-md',
    luxury: 'max-w-lg',
    compact: 'max-w-xs',
  };

  const aspectRatios = {
    default: 'aspect-[4/3]',
    premium: 'aspect-[5/4]',
    luxury: 'aspect-[3/2]',
    compact: 'aspect-[4/3]',
  };

  return (
    <Link href={`/property/${id}`}>
      <Card
        className={cn(
          'group cursor-pointer border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] animate-slide-up rounded-2xl backdrop-blur-sm',
          variantStyles[variant],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Gallery Section */}
        <div className='relative overflow-hidden'>
          <div className={cn('relative overflow-hidden', aspectRatios[variant])}>
            {/* Main Image */}
            <Image
              src={images[currentImageIndex] || images[0]}
              alt={title}
              fill
              className={cn(
                'object-cover transition-all duration-700',
                'group-hover:scale-110',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />

            {/* Image Loading Skeleton */}
            {!imageLoaded && <div className='absolute inset-0 bg-gray-200 animate-pulse' />}

            {/* Premium overlay on hover */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-all duration-500',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            />

            {/* Luxury shimmer effect */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000',
                isHovered ? 'translate-x-full' : '-translate-x-full'
              )}
            />
          </div>

          {/* Top Row Controls */}
          <div className='absolute top-4 left-4 right-4 flex items-start justify-between'>
            <div className='flex flex-col gap-2'>
              {/* Property Badge */}
              {badge && (
                <div
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm',
                    getBadgeStyle(badge)
                  )}
                >
                  {badge}
                </div>
              )}

              {/* Discount Badge */}
              {discount && (
                <div className='px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm'>
                  {discount}% OFF
                </div>
              )}

              {/* Featured Badge */}
              {isFeatured && (
                <div className='flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm'>
                  <Sparkles className='w-3 h-3 mr-1' />
                  Featured
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-2'>
              {/* Favorite Button */}
              <button
                onClick={handleFavorite}
                className={cn(
                  'p-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 group/fav',
                  isFavorited
                    ? 'bg-red-50/90 hover:bg-red-100/90 ring-2 ring-red-200'
                    : 'bg-white/90 hover:bg-white ring-1 ring-white/20'
                )}
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-all duration-300 group-hover/fav:scale-110',
                    isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
                  )}
                />
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className='p-3 bg-white/90 backdrop-blur-xl rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 ring-1 ring-white/20 group/share'
              >
                <Share className='w-4 h-4 text-gray-600 hover:text-primary transition-all duration-300 group-hover/share:scale-110' />
              </button>

              {/* Save Button */}
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className='p-3 bg-white/90 backdrop-blur-xl rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 ring-1 ring-white/20 group/save'
              >
                <Bookmark className='w-4 h-4 text-gray-600 hover:text-primary transition-all duration-300 group-hover/save:scale-110' />
              </button>
            </div>
          </div>

          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    index === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/60 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          )}

          {/* Quick View Button */}
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100'>
            <Button
              size='lg'
              variant='glass'
              className='font-semibold shadow-2xl backdrop-blur-xl bg-white/20 border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                // Handle quick view
              }}
            >
              <Eye className='w-5 h-5 mr-2' />
              Quick View
            </Button>
          </div>

          {/* Verification Badge */}
          {isVerified && (
            <div className='absolute bottom-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg'>
              <Award className='w-4 h-4 text-white' />
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className={cn('p-6', variant === 'compact' ? 'p-4' : 'p-6')}>
          {/* Header */}
          <div className='flex items-start justify-between mb-3'>
            <h3
              className={cn(
                'font-bold leading-tight flex-1 pr-3 group-hover:text-primary transition-colors line-clamp-2',
                variant === 'luxury' ? 'text-xl' : 'text-lg'
              )}
            >
              {title}
            </h3>
            <div className='flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200 flex-shrink-0'>
              <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-bold text-gray-900'>{rating}</span>
            </div>
          </div>

          {/* Location */}
          <p className='text-gray-600 text-sm mb-4 flex items-center'>
            <MapPin className='w-4 h-4 mr-2 text-primary' />
            {location}
          </p>

          {/* Host Information */}
          {host && (
            <div className='flex items-center mb-4'>
              <div className='w-6 h-6 relative mr-2'>
                <Image
                  src={host.avatar}
                  alt={host.name}
                  fill
                  className='rounded-full object-cover'
                  sizes='24px'
                />
              </div>
              <span className='text-sm text-gray-600'>
                Hosted by <span className='font-medium text-gray-900'>{host.name}</span>
              </span>
              {host.isSuperhost && (
                <div className='ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-bold'>
                  Superhost
                </div>
              )}
            </div>
          )}

          {/* Amenities */}
          <div
            className={cn(
              'mb-6',
              variant === 'luxury' ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'
            )}
          >
            {amenities.slice(0, variant === 'luxury' ? 6 : 4).map(amenity => (
              <span
                key={amenity}
                className={cn(
                  'px-2 py-1 bg-gray-50 text-gray-700 rounded-lg font-medium text-center',
                  variant === 'compact' ? 'text-xs' : 'text-xs'
                )}
              >
                {amenity}
              </span>
            ))}
            {amenities.length > (variant === 'luxury' ? 6 : 4) && (
              <span className='text-xs text-gray-500 self-center'>
                +{amenities.length - (variant === 'luxury' ? 6 : 4)} more
              </span>
            )}
          </div>

          {/* Pricing and Reviews */}
          <div className='flex items-center justify-between pt-4 border-t border-gray-100/80'>
            <div className='flex items-center space-x-3'>
              <div className='flex items-baseline'>
                <span
                  className={cn(
                    'font-bold text-gray-900 tracking-tight',
                    variant === 'luxury' ? 'text-3xl' : 'text-2xl'
                  )}
                >
                  ${price}
                </span>
                <span className='text-gray-600 text-sm ml-1 font-medium'>/night</span>
              </div>
              {originalPrice && (
                <div className='flex flex-col'>
                  <span className='text-sm text-gray-400 line-through'>${originalPrice}</span>
                  {discount && (
                    <span className='text-xs text-green-600 font-semibold'>Save {discount}%</span>
                  )}
                </div>
              )}
            </div>
            <div className='flex flex-col items-end'>
              <div className='flex items-center text-sm text-gray-500 mb-1'>
                <Star className='w-3 h-3 text-yellow-400 mr-1' />
                <span className='font-semibold text-gray-900'>{rating}</span>
                <span className='ml-1'>({reviews})</span>
              </div>
              {variant === 'luxury' && (
                <div className='text-xs text-primary font-medium'>🔥 Trending</div>
              )}
            </div>
          </div>

          {/* Quick Actions for Luxury Variant */}
          {variant === 'luxury' && (
            <div className='flex gap-2 mt-4 pt-4 border-t border-gray-100'>
              <Button
                size='sm'
                variant='outline'
                className='flex-1'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Calendar className='w-4 h-4 mr-2' />
                Check Dates
              </Button>
              <Button
                size='sm'
                className='flex-1'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Book Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

// Property Grid Component
interface PropertyGridProps {
  properties: Array<Omit<PropertyCardProps, 'className'>>;
  variant?: 'default' | 'premium' | 'luxury' | 'compact';
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
  onFavorite?: (id: string | number) => void;
  onShare?: (id: string | number) => void;
  favoriteIds?: (string | number)[];
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  variant = 'default',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className,
  onFavorite,
  onShare,
  favoriteIds = [],
}) => {
  const gridCols = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;

  return (
    <div
      className={cn(
        'grid gap-8',
        `grid-cols-1 md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`,
        className
      )}
    >
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          {...property}
          variant={variant}
          onFavorite={onFavorite}
          onShare={onShare}
          isFavorited={favoriteIds.includes(property.id)}
          className='animate-slide-up'
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
