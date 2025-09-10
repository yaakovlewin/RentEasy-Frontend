/**
 * Rich Snippets Components - RentEasy
 * 
 * Components for generating rich snippets with Schema.org markup
 * to enhance search result appearance and click-through rates.
 * 
 * Features:
 * - Property/accommodation rich snippets
 * - Review and rating rich snippets  
 * - FAQ rich snippets
 * - Breadcrumb rich snippets
 * - Event and offer rich snippets
 * - Automatic Schema.org JSON-LD generation
 * - Visual rich snippet previews
 */

'use client';

import React from 'react';
import { Star, MapPin, Users, Bed, Bath, Wifi, Car, Coffee } from 'lucide-react';
import { StructuredDataComponent } from './StructuredData';
import { generateAccommodationSchema, generateFAQPageSchema } from '@/lib/seo/structured-data';
import type { PropertyData, FAQItem } from '@/lib/seo/structured-data';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPERTY RICH SNIPPETS
// ============================================================================

interface PropertyRichSnippetProps {
  property: PropertyData;
  showVisualPreview?: boolean;
  className?: string;
}

/**
 * Property/Accommodation Rich Snippet Component
 */
export const PropertyRichSnippet: React.FC<PropertyRichSnippetProps> = ({
  property,
  showVisualPreview = false,
  className,
}) => {
  const structuredData = generateAccommodationSchema(property);

  const amenityIcons: Record<string, React.ReactNode> = {
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Kitchen': <Coffee className="h-4 w-4" />,
    'WiFi': <Wifi className="h-4 w-4" />,
    'Free parking': <Car className="h-4 w-4" />,
    'Coffee maker': <Coffee className="h-4 w-4" />,
  };

  return (
    <>
      {/* Structured Data */}
      <StructuredDataComponent data={structuredData} />
      
      {/* Visual Preview (for development/preview purposes) */}
      {showVisualPreview && (
        <div className={cn(
          'border rounded-lg p-4 bg-white shadow-sm max-w-md',
          'rich-snippet-preview',
          className
        )}>
          <div className="space-y-3">
            {/* Property Image */}
            {property.images && property.images.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={property.images[0].url}
                  alt={property.images[0].alt}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and Location */}
            <div>
              <h3 className="font-semibold text-lg text-blue-600 hover:underline cursor-pointer">
                {property.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location.city}, {property.location.country}
              </div>
            </div>

            {/* Rating */}
            {property.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(property.rating!.average)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {property.rating.average.toFixed(1)} ({property.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Property Details */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                </div>
              )}
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {property.maxGuests} guests
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 6).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600"
                  >
                    {amenityIcons[amenity.name] || <div className="w-4 h-4" />}
                    <span className="ml-1">{amenity.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                {property.pricing.currency === 'USD' ? '$' : property.pricing.currency}
                {property.pricing.basePrice}
                <span className="text-sm font-normal text-gray-600">/night</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                ✓ Available
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {property.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// REVIEW RICH SNIPPETS
// ============================================================================

interface ReviewRichSnippetProps {
  reviews: Array<{
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  aggregateRating?: {
    average: number;
    count: number;
  };
  itemName: string;
  showVisualPreview?: boolean;
  className?: string;
}

/**
 * Reviews Rich Snippet Component
 */
export const ReviewRichSnippet: React.FC<ReviewRichSnippetProps> = ({
  reviews,
  aggregateRating,
  itemName,
  showVisualPreview = false,
  className,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.average,
        reviewCount: aggregateRating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewBody: review.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <StructuredDataComponent data={structuredData} />
      
      {/* Visual Preview */}
      {showVisualPreview && (
        <div className={cn(
          'border rounded-lg p-4 bg-white shadow-sm',
          'rich-snippet-preview',
          className
        )}>
          {/* Aggregate Rating */}
          {aggregateRating && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.floor(aggregateRating.average)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold">
                {aggregateRating.average.toFixed(1)}
              </span>
              <span className="text-gray-600">
                ({aggregateRating.count} reviews)
              </span>
            </div>
          )}

          {/* Individual Reviews */}
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// FAQ RICH SNIPPETS
// ============================================================================

interface FAQRichSnippetProps {
  faqs: FAQItem[];
  pageName?: string;
  showVisualPreview?: boolean;
  className?: string;
}

/**
 * FAQ Rich Snippet Component
 */
export const FAQRichSnippet: React.FC<FAQRichSnippetProps> = ({
  faqs,
  pageName,
  showVisualPreview = false,
  className,
}) => {
  const structuredData = generateFAQPageSchema(faqs, pageName);

  return (
    <>
      {/* Structured Data */}
      <StructuredDataComponent data={structuredData} />
      
      {/* Visual Preview */}
      {showVisualPreview && (
        <div className={cn(
          'border rounded-lg p-4 bg-white shadow-sm',
          'rich-snippet-preview',
          className
        )}>
          <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.slice(0, 5).map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                <h4 className="font-medium text-blue-600 mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// OFFER RICH SNIPPETS
// ============================================================================

interface OfferRichSnippetProps {
  offer: {
    name: string;
    description: string;
    price: number;
    currency: string;
    validFrom?: string;
    validThrough?: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    seller: string;
    category?: string;
  };
  showVisualPreview?: boolean;
  className?: string;
}

/**
 * Offer Rich Snippet Component
 */
export const OfferRichSnippet: React.FC<OfferRichSnippetProps> = ({
  offer,
  showVisualPreview = false,
  className,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.name,
    description: offer.description,
    price: offer.price,
    priceCurrency: offer.currency,
    availability: `https://schema.org/${offer.availability}`,
    ...(offer.validFrom && { validFrom: offer.validFrom }),
    ...(offer.validThrough && { priceValidUntil: offer.validThrough }),
    seller: {
      '@type': 'Organization',
      name: offer.seller,
    },
    ...(offer.category && { category: offer.category }),
  };

  return (
    <>
      {/* Structured Data */}
      <StructuredDataComponent data={structuredData} />
      
      {/* Visual Preview */}
      {showVisualPreview && (
        <div className={cn(
          'border rounded-lg p-4 bg-white shadow-sm',
          'rich-snippet-preview',
          className
        )}>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-blue-600">
              {offer.name}
            </h3>
            <p className="text-sm text-gray-600">
              {offer.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {offer.currency === 'USD' ? '$' : offer.currency}
                {offer.price}
              </div>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                offer.availability === 'InStock' 
                  ? 'bg-green-100 text-green-800'
                  : offer.availability === 'OutOfStock'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              )}>
                {offer.availability === 'InStock' ? 'Available' : 
                 offer.availability === 'OutOfStock' ? 'Sold Out' : 'Pre-Order'}
              </div>
            </div>
            {(offer.validFrom || offer.validThrough) && (
              <div className="text-xs text-gray-500">
                Valid {offer.validFrom && `from ${new Date(offer.validFrom).toLocaleDateString()}`}
                {offer.validFrom && offer.validThrough && ' '}
                {offer.validThrough && `until ${new Date(offer.validThrough).toLocaleDateString()}`}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// COMPOSITE RICH SNIPPET COMPONENT
// ============================================================================

interface RichSnippetsProps {
  property?: PropertyData;
  reviews?: ReviewRichSnippetProps['reviews'];
  aggregateRating?: ReviewRichSnippetProps['aggregateRating'];
  faqs?: FAQItem[];
  offers?: OfferRichSnippetProps['offer'][];
  showVisualPreviews?: boolean;
  className?: string;
}

/**
 * Composite Rich Snippets Component
 */
export const RichSnippets: React.FC<RichSnippetsProps> = ({
  property,
  reviews,
  aggregateRating,
  faqs,
  offers,
  showVisualPreviews = false,
  className,
}) => {
  return (
    <div className={cn('rich-snippets-container', className)}>
      {property && (
        <PropertyRichSnippet
          property={property}
          showVisualPreview={showVisualPreviews}
        />
      )}

      {reviews && reviews.length > 0 && (
        <ReviewRichSnippet
          reviews={reviews}
          aggregateRating={aggregateRating}
          itemName={property?.title || 'Item'}
          showVisualPreview={showVisualPreviews}
        />
      )}

      {faqs && faqs.length > 0 && (
        <FAQRichSnippet
          faqs={faqs}
          showVisualPreview={showVisualPreviews}
        />
      )}

      {offers && offers.length > 0 && (
        <>
          {offers.map((offer, index) => (
            <OfferRichSnippet
              key={index}
              offer={offer}
              showVisualPreview={showVisualPreviews}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default RichSnippets;