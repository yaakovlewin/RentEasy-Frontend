import React, { forwardRef } from 'react';

import { usePropertyCard } from './hooks/usePropertyCard';
import { PropertyCardActions } from './components/PropertyCardActions';
import { PropertyCardContent } from './components/PropertyCardContent';
import { PropertyCardFooter } from './components/PropertyCardFooter';
import { PropertyCardHeader } from './components/PropertyCardHeader';
import { PropertyCardImage } from './components/PropertyCardImage';
import type { PropertyCardProps } from './types';

const PropertyCard = forwardRef<HTMLDivElement, PropertyCardProps>(
  (
    {
      property,
      variant = 'default',
      size = 'md',
      features,
      fields,
      loading,
      selection,
      interaction,
      actions,
      className,
      style,
      imageAspectRatio = 1.5,
      renderPrice,
      renderTitle,
      renderActions,
      renderBadges,
      ...props
    },
    ref
  ) => {
    const {
      isHovered,
      isFocused,
      isSelected,
      isFavorited,
      handleClick,
      handleFavorite,
      handleShare,
      handleSelect,
      handleEdit,
      handleDelete,
      handleView,
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleKeyDown,
      getCardClassName,
      getVariantClassName,
      getSizeClassName,
    } = usePropertyCard({
      property,
      variant,
      size,
      features,
      actions,
      selection,
      interaction,
    });

    // Merge features with variant defaults
    const finalFeatures = {
      favorites: variant === 'favorites' || features?.favorites || false,
      quickActions: features?.quickActions ?? true,
      selection: features?.selection || selection?.selected !== undefined,
      management: variant === 'management' || features?.management || false,
      carousel: features?.carousel ?? true,
      badges: features?.badges ?? true,
      details: features?.details ?? true,
      hostInfo: features?.hostInfo ?? (variant !== 'compact'),
      pricingDetails: features?.pricingDetails ?? true,
      animations: features?.animations ?? true,
      ...features,
    };

    // Enhanced loading state
    const isLoading = loading?.loading || loading?.imageLoading;

    // Enhanced interaction state
    const finalInteraction = {
      isFavorited: isFavorited || interaction?.isFavorited || false,
      favoriteDisabled: interaction?.favoriteDisabled || false,
      isHovered: isHovered || interaction?.isHovered || false,
      isFocused: isFocused || interaction?.isFocused || false,
      ...interaction,
    };

    // Enhanced actions with handlers
    const finalActions = {
      onFavorite: handleFavorite,
      onShare: handleShare,
      onSelect: handleSelect,
      onClick: handleClick,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onView: handleView,
      ...actions,
    };

    // Render different layouts based on variant
    const renderCardContent = () => {
      switch (variant) {
        case 'list':
          return (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <PropertyCardImage
                  property={property}
                  variant={variant}
                  size={size}
                  aspectRatio={imageAspectRatio}
                  enableCarousel={finalFeatures.carousel}
                  onImageClick={() => finalActions.onClick?.(property)}
                  className="w-32 h-24 rounded-lg overflow-hidden"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <PropertyCardHeader
                  property={property}
                  variant={variant}
                  showBadges={finalFeatures.badges}
                  actions={{
                    onFavorite: finalFeatures.favorites ? handleFavorite : undefined,
                    onShare: finalFeatures.quickActions ? handleShare : undefined,
                    onSelect: finalFeatures.selection ? handleSelect : undefined,
                  }}
                  interaction={finalInteraction}
                  loading={loading}
                  className="mb-2"
                />
                
                <PropertyCardContent
                  property={property}
                  variant={variant}
                  fields={fields}
                  showDetails={finalFeatures.details}
                  showHost={finalFeatures.hostInfo}
                  renderPrice={renderPrice}
                  renderTitle={renderTitle}
                  className="mb-2"
                />
                
                <div className="flex items-center justify-between">
                  <PropertyCardFooter
                    property={property}
                    variant={variant}
                    showRating={true}
                    showHost={false}
                    showTimestamp={false}
                  />
                  
                  {(finalFeatures.management || finalFeatures.quickActions) && (
                    <PropertyCardActions
                      property={property}
                      variant={variant}
                      actions={finalActions}
                      features={finalFeatures}
                      loading={loading}
                      className="ml-4"
                    />
                  )}
                </div>
              </div>
            </div>
          );

        case 'compact':
          return (
            <div className="space-y-3">
              <PropertyCardImage
                property={property}
                variant={variant}
                size={size}
                aspectRatio={imageAspectRatio}
                enableCarousel={false}
                onImageClick={() => finalActions.onClick?.(property)}
                className="w-full h-32 rounded-lg overflow-hidden"
              />
              
              <div className="space-y-2">
                <PropertyCardContent
                  property={property}
                  variant={variant}
                  fields={fields}
                  showDetails={false}
                  showHost={false}
                  renderPrice={renderPrice}
                  renderTitle={renderTitle}
                />
                
                <div className="flex items-center justify-between">
                  <PropertyCardFooter
                    property={property}
                    variant={variant}
                    showRating={true}
                    showHost={false}
                    showTimestamp={false}
                  />
                  
                  {finalFeatures.favorites && (
                    <PropertyCardActions
                      property={property}
                      variant={variant}
                      actions={finalActions}
                      features={{ ...finalFeatures, quickActions: false, management: false }}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="flex flex-col h-full">
              <div className="relative">
                <PropertyCardImage
                  property={property}
                  variant={variant}
                  size={size}
                  aspectRatio={imageAspectRatio}
                  enableCarousel={finalFeatures.carousel}
                  onImageClick={() => finalActions.onClick?.(property)}
                />
                
                <PropertyCardHeader
                  property={property}
                  variant={variant}
                  showBadges={finalFeatures.badges}
                  actions={{
                    onFavorite: finalFeatures.favorites ? handleFavorite : undefined,
                    onShare: finalFeatures.quickActions ? handleShare : undefined,
                    onSelect: finalFeatures.selection ? handleSelect : undefined,
                  }}
                  interaction={finalInteraction}
                  loading={loading}
                  className="absolute top-3 inset-x-3"
                />
              </div>
              
              <div className="flex-1 p-4 flex flex-col">
                <PropertyCardContent
                  property={property}
                  variant={variant}
                  fields={fields}
                  showDetails={finalFeatures.details}
                  showHost={finalFeatures.hostInfo}
                  renderPrice={renderPrice}
                  renderTitle={renderTitle}
                  className="flex-1 mb-3"
                />
                
                <div className="space-y-3">
                  <PropertyCardFooter
                    property={property}
                    variant={variant}
                    showRating={true}
                    showHost={finalFeatures.hostInfo}
                    showTimestamp={variant === 'management'}
                  />
                  
                  {(finalFeatures.management || finalFeatures.quickActions) && (
                    <PropertyCardActions
                      property={property}
                      variant={variant}
                      actions={finalActions}
                      features={finalFeatures}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={getCardClassName()}
        style={style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={props.tabIndex ?? 0}
        aria-label={props['aria-label'] || `Property: ${property.title}`}
        {...props}
      >
        {/* Custom render function for entire card */}
        {renderActions ? (
          renderActions(property, finalActions)
        ) : (
          <>
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Card content */}
            {renderCardContent()}
            
            {/* Custom badges */}
            {renderBadges && (
              <div className="absolute top-3 left-3">
                {renderBadges(property)}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';

export { PropertyCard };
export type { PropertyCardProps };