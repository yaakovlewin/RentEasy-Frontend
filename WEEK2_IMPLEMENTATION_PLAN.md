# WEEK 2 IMPLEMENTATION PLAN: FP REFACTORING EXECUTION

**Team C - Component Refactoring Implementation**
**Timeline**: 5 Working Days (40 hours)
**Team**: 6 Senior FP Developers
**Prerequisites**: Week 1 Analysis Complete ✓

---

## OVERVIEW

This document provides a detailed, hour-by-hour implementation plan for refactoring three major components using functional programming principles. Each task is assigned to specific team members and includes clear success criteria.

**Target Components**:
1. PropertyCard (486 lines → ~200 lines)
2. DashboardSettings (717 lines → ~300 lines)
3. SearchBarCore (502 lines → ~180 lines)

**Expected Total Code Reduction**: 1,705 lines → ~680 lines (60% reduction)

---

## TEAM ROLES & RESPONSIBILITIES

**Senior Dev 1** - Component Architecture Lead
- Responsible for: Overall architecture, reducer design, pattern enforcement
- Primary focus: State management, architecture decisions

**Senior Dev 2** - Pure Functions Specialist
- Responsible for: Extracting pure functions, utility modules
- Primary focus: Business logic extraction, pure transformations

**Senior Dev 3** - Render Props & HOC Expert
- Responsible for: Render props patterns, higher-order components
- Primary focus: Component composition, reusable abstractions

**Senior Dev 4** - Performance & Optimization
- Responsible for: Memoization, performance optimization, benchmarking
- Primary focus: React.memo, useMemo, useCallback optimization

**Senior Dev 5** - Composition Patterns Lead
- Responsible for: Component splitting, composition architecture
- Primary focus: Breaking monoliths into composable pieces

**Senior Dev 6** - Testing & Quality Assurance
- Responsible for: Test coverage, integration tests, quality gates
- Primary focus: Testing pure functions, reducers, components

---

## DAY 1: PROPERTYCARD REFACTORING (Phase 1)

**Goal**: Extract pure functions and implement reducer
**Duration**: 8 hours
**Components**: PropertyCard (486 lines)

### Morning Session (4h) - Pure Function Extraction

#### Task 1.1: Extract Utility Functions (2h)
**Assigned to**: Senior Dev 2
**Deliverables**:
```typescript
// File: /lib/utils/propertyCardUtils.ts

// Pure badge style mapping
export const getBadgeStyle = (badge: string): string => {
  const styles = {
    Superhost: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    'Rare Find': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    Luxury: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    Premium: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    Unique: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    Featured: 'bg-gradient-to-r from-primary to-pink-500 text-white',
  };
  return styles[badge as keyof typeof styles] ?? 'bg-gray-800 text-white';
};

// Pure variant style mapping
export const getVariantStyle = (variant: PropertyCardVariant): string => {
  const styles = {
    default: 'max-w-sm',
    premium: 'max-w-md',
    luxury: 'max-w-lg',
    compact: 'max-w-xs',
  };
  return styles[variant];
};

// Pure aspect ratio mapping
export const getAspectRatio = (variant: PropertyCardVariant): string => {
  const ratios = {
    default: 'aspect-[4/3]',
    premium: 'aspect-[5/4]',
    luxury: 'aspect-[3/2]',
    compact: 'aspect-[4/3]',
  };
  return ratios[variant];
};

// Pure image index calculation
export const getNextImageIndex = (current: number, total: number): number =>
  (current + 1) % total;

// Pure amenities truncation
export const getTruncatedAmenities = (
  amenities: string[],
  maxCount: number
): { visible: string[]; remaining: number } => ({
  visible: amenities.slice(0, maxCount),
  remaining: Math.max(0, amenities.length - maxCount),
});
```

**Success Criteria**:
- ✓ All utility functions exported
- ✓ 100% pure (no side effects)
- ✓ Fully typed with TypeScript
- ✓ Unit tests written (15+ tests)

#### Task 1.2: Design Reducer Architecture (2h)
**Assigned to**: Senior Dev 1
**Deliverables**:
```typescript
// File: /components/ui/property-card/propertyCardReducer.ts

export type PropertyCardState = {
  currentImageIndex: number;
  isHovered: boolean;
  imageLoaded: boolean;
};

export type PropertyCardAction =
  | { type: 'NEXT_IMAGE'; totalImages: number }
  | { type: 'SET_IMAGE'; index: number }
  | { type: 'SET_HOVER'; isHovered: boolean }
  | { type: 'IMAGE_LOADED' }
  | { type: 'RESET' };

export const createInitialState = (
  totalImages: number = 0
): PropertyCardState => ({
  currentImageIndex: 0,
  isHovered: false,
  imageLoaded: false,
});

export const propertyCardReducer = (
  state: PropertyCardState,
  action: PropertyCardAction
): PropertyCardState => {
  switch (action.type) {
    case 'NEXT_IMAGE':
      return {
        ...state,
        currentImageIndex: getNextImageIndex(
          state.currentImageIndex,
          action.totalImages
        ),
      };

    case 'SET_IMAGE':
      return {
        ...state,
        currentImageIndex: action.index,
      };

    case 'SET_HOVER':
      return {
        ...state,
        isHovered: action.isHovered,
      };

    case 'IMAGE_LOADED':
      return {
        ...state,
        imageLoaded: true,
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
};
```

**Success Criteria**:
- ✓ All state transitions through reducer
- ✓ Pure functions (immutable updates)
- ✓ Discriminated union types
- ✓ Reducer tests written (20+ tests)

### Afternoon Session (4h) - Pure Render Functions

#### Task 1.3: Extract Image Rendering (2h)
**Assigned to**: Senior Dev 5
**Deliverables**:
```typescript
// File: /components/ui/property-card/PropertyCardImage.tsx

type PropertyCardImageProps = {
  images: string[];
  currentIndex: number;
  isHovered: boolean;
  imageLoaded: boolean;
  variant: PropertyCardVariant;
  onImageLoad: () => void;
  onImageSelect: (index: number) => void;
};

export const renderPropertyCardImage = ({
  images,
  currentIndex,
  isHovered,
  imageLoaded,
  variant,
  onImageLoad,
  onImageSelect,
}: PropertyCardImageProps): JSX.Element => {
  const aspectRatio = getAspectRatio(variant);

  return (
    <div className="relative overflow-hidden">
      <div className={cn('relative overflow-hidden', aspectRatio)}>
        {/* Main Image */}
        <Image
          src={images[currentIndex] || images[0]}
          alt="Property"
          fill
          className={cn(
            'object-cover transition-all duration-700',
            'group-hover:scale-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={onImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Hover Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-all duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* Image Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageSelect(index);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PropertyCardImage = memo(renderPropertyCardImage);
```

**Success Criteria**:
- ✓ Pure render function extracted
- ✓ All image logic separated
- ✓ Memoized component exported
- ✓ Component tests written

#### Task 1.4: Extract Content Rendering (2h)
**Assigned to**: Senior Dev 5
**Deliverables**:
```typescript
// File: /components/ui/property-card/PropertyCardContent.tsx

type PropertyCardContentProps = {
  title: string;
  location: string;
  rating: number;
  reviews: number;
  host?: HostInfo;
  amenities: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  variant: PropertyCardVariant;
};

export const renderPropertyCardContent = (
  props: PropertyCardContentProps
): JSX.Element => {
  const { visible: visibleAmenities, remaining } = getTruncatedAmenities(
    props.amenities,
    props.variant === 'luxury' ? 6 : 4
  );

  return (
    <CardContent className={cn('p-6', props.variant === 'compact' ? 'p-4' : 'p-6')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3
          className={cn(
            'font-bold leading-tight flex-1 pr-3 group-hover:text-primary transition-colors line-clamp-2',
            props.variant === 'luxury' ? 'text-xl' : 'text-lg'
          )}
        >
          {props.title}
        </h3>
        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200 flex-shrink-0">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-900">{props.rating}</span>
        </div>
      </div>

      {/* Location */}
      <p className="text-gray-600 text-sm mb-4 flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-primary" />
        {props.location}
      </p>

      {/* Host */}
      {props.host && renderHostInfo(props.host)}

      {/* Amenities */}
      <div className={cn('mb-6', props.variant === 'luxury' ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2')}>
        {visibleAmenities.map((amenity) => (
          <span
            key={amenity}
            className={cn(
              'px-2 py-1 bg-gray-50 text-gray-700 rounded-lg font-medium text-center',
              props.variant === 'compact' ? 'text-xs' : 'text-xs'
            )}
          >
            {amenity}
          </span>
        ))}
        {remaining > 0 && (
          <span className="text-xs text-gray-500 self-center">
            +{remaining} more
          </span>
        )}
      </div>

      {/* Pricing */}
      {renderPricing(props)}
    </CardContent>
  );
};

const renderHostInfo = (host: HostInfo): JSX.Element => (
  <div className="flex items-center mb-4">
    <div className="w-6 h-6 relative mr-2">
      <Image src={host.avatar} alt={host.name} fill className="rounded-full object-cover" sizes="24px" />
    </div>
    <span className="text-sm text-gray-600">
      Hosted by <span className="font-medium text-gray-900">{host.name}</span>
    </span>
    {host.isSuperhost && (
      <div className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-bold">
        Superhost
      </div>
    )}
  </div>
);

const renderPricing = ({
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  variant,
}: Pick<PropertyCardContentProps, 'price' | 'originalPrice' | 'discount' | 'rating' | 'reviews' | 'variant'>): JSX.Element => (
  <div className="flex items-center justify-between pt-4 border-t border-gray-100/80">
    <div className="flex items-center space-x-3">
      <div className="flex items-baseline">
        <span className={cn('font-bold text-gray-900 tracking-tight', variant === 'luxury' ? 'text-3xl' : 'text-2xl')}>
          ${price}
        </span>
        <span className="text-gray-600 text-sm ml-1 font-medium">/night</span>
      </div>
      {originalPrice && (
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 line-through">${originalPrice}</span>
          {discount && <span className="text-xs text-green-600 font-semibold">Save {discount}%</span>}
        </div>
      )}
    </div>
    <div className="flex flex-col items-end">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <Star className="w-3 h-3 text-yellow-400 mr-1" />
        <span className="font-semibold text-gray-900">{rating}</span>
        <span className="ml-1">({reviews})</span>
      </div>
      {variant === 'luxury' && <div className="text-xs text-primary font-medium">Trending</div>}
    </div>
  </div>
);

export const PropertyCardContent = memo(renderPropertyCardContent);
```

**Success Criteria**:
- ✓ Content rendering extracted
- ✓ Pure functions for each section
- ✓ Proper composition
- ✓ Component tests written

---

## DAY 2: PROPERTYCARD REFACTORING (Phase 2)

**Goal**: Complete PropertyCard refactoring with composition
**Duration**: 8 hours

### Morning Session (4h) - Component Assembly

#### Task 2.1: Extract Action Components (2h)
**Assigned to**: Senior Dev 3
**Deliverables**:
```typescript
// File: /components/ui/property-card/PropertyCardActions.tsx

type PropertyCardActionsProps = {
  id: string | number;
  isFavorited: boolean;
  onFavorite?: (id: string | number) => void;
  onShare?: (id: string | number) => void;
};

// Curried event creators
const createFavoriteHandler = (
  id: string | number,
  onFavorite?: (id: string | number) => void
) => (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  onFavorite?.(id);
};

const createShareHandler = (
  id: string | number,
  onShare?: (id: string | number) => void
) => (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  onShare?.(id);
};

export const renderPropertyCardActions = ({
  id,
  isFavorited,
  onFavorite,
  onShare,
}: PropertyCardActionsProps): JSX.Element => (
  <div className="absolute top-4 right-4 flex flex-col gap-2">
    {/* Favorite Button */}
    <button
      onClick={createFavoriteHandler(id, onFavorite)}
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
      onClick={createShareHandler(id, onShare)}
      className="p-3 bg-white/90 backdrop-blur-xl rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 ring-1 ring-white/20 group/share"
    >
      <Share className="w-4 h-4 text-gray-600 hover:text-primary transition-all duration-300 group-hover/share:scale-110" />
    </button>
  </div>
);

export const PropertyCardActions = memo(renderPropertyCardActions);
```

**Success Criteria**:
- ✓ Actions extracted as pure component
- ✓ Curried event handlers implemented
- ✓ Proper event isolation
- ✓ Tests for event handling

#### Task 2.2: Assemble Main Component (2h)
**Assigned to**: Senior Dev 1
**Deliverables**:
```typescript
// File: /components/ui/property-card/PropertyCard.tsx

import { useReducer, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { propertyCardReducer, createInitialState } from './propertyCardReducer';
import { PropertyCardImage } from './PropertyCardImage';
import { PropertyCardContent } from './PropertyCardContent';
import { PropertyCardActions } from './PropertyCardActions';
import { PropertyCardBadges } from './PropertyCardBadges';
import { getVariantStyle } from '@/lib/utils/propertyCardUtils';

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
  isFeatured,
  discount,
  isVerified,
  host,
  className,
  variant = 'default',
  onFavorite,
  onShare,
  isFavorited = false,
}) => {
  // ===== STATE MANAGEMENT =====
  const [state, dispatch] = useReducer(
    propertyCardReducer,
    images.length,
    createInitialState
  );

  // ===== SIDE EFFECTS =====
  // Auto-cycle images on hover
  useEffect(() => {
    if (state.isHovered && images.length > 1) {
      const interval = setInterval(() => {
        dispatch({ type: 'NEXT_IMAGE', totalImages: images.length });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [state.isHovered, images.length]);

  // ===== EVENT HANDLERS =====
  const handleImageSelect = useCallback((index: number) => {
    dispatch({ type: 'SET_IMAGE', index });
  }, []);

  const handleImageLoad = useCallback(() => {
    dispatch({ type: 'IMAGE_LOADED' });
  }, []);

  const handleMouseEnter = useCallback(() => {
    dispatch({ type: 'SET_HOVER', isHovered: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SET_HOVER', isHovered: false });
  }, []);

  // ===== RENDER =====
  return (
    <Link href={`/property/${id}`}>
      <Card
        className={cn(
          'group cursor-pointer border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] animate-slide-up rounded-2xl backdrop-blur-sm',
          getVariantStyle(variant),
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section */}
        <PropertyCardImage
          images={images}
          currentIndex={state.currentImageIndex}
          isHovered={state.isHovered}
          imageLoaded={state.imageLoaded}
          variant={variant}
          onImageLoad={handleImageLoad}
          onImageSelect={handleImageSelect}
        />

        {/* Badges Overlay */}
        <PropertyCardBadges
          badge={badge}
          discount={discount}
          isFeatured={isFeatured}
          isVerified={isVerified}
        />

        {/* Actions Overlay */}
        <PropertyCardActions
          id={id}
          isFavorited={isFavorited}
          onFavorite={onFavorite}
          onShare={onShare}
        />

        {/* Content Section */}
        <PropertyCardContent
          title={title}
          location={location}
          rating={rating}
          reviews={reviews}
          host={host}
          amenities={amenities}
          price={price}
          originalPrice={originalPrice}
          discount={discount}
          variant={variant}
        />
      </Card>
    </Link>
  );
};

export default memo(PropertyCard);
```

**Success Criteria**:
- ✓ All pieces composed together
- ✓ Reducer managing all state
- ✓ Pure components for rendering
- ✓ Clean separation of concerns
- ✓ 60% code reduction achieved

### Afternoon Session (4h) - Testing & Documentation

#### Task 2.3: Comprehensive Testing (3h)
**Assigned to**: Senior Dev 6
**Deliverables**:
- Pure function tests (propertyCardUtils.test.ts)
- Reducer tests (propertyCardReducer.test.ts)
- Component integration tests (PropertyCard.test.tsx)
- Coverage report (target: 90%+)

#### Task 2.4: Documentation & Code Review (1h)
**Assigned to**: All team members
**Deliverables**:
- JSDoc comments on all exports
- Usage examples
- Code review session
- Performance benchmarks

---

## DAY 3: DASHBOARDSETTINGS REFACTORING (Phase 1)

**Goal**: Unified state management with reducer
**Duration**: 8 hours
**Components**: DashboardSettings (717 lines)

### Morning Session (4h) - Unified Reducer Design

#### Task 3.1: Design Unified State Structure (2h)
**Assigned to**: Senior Dev 1
**Deliverables**:
```typescript
// File: /components/dashboard/components/dashboardSettingsReducer.ts

export type DashboardSettingsState = {
  settings: {
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    security: SecuritySettings;
  };
  ui: {
    isChangingPassword: boolean;
    isEnabling2FA: boolean;
    showDeleteDialog: boolean;
    confirmationText: string;
    isDeleting: boolean;
    activeSection: 'notifications' | 'privacy' | 'security' | 'danger' | null;
  };
  meta: {
    hasChanges: boolean;
    lastSaved: Date | null;
    errors: Record<string, string>;
  };
};

export type DashboardSettingsAction =
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_PRIVACY'; payload: Partial<PrivacySettings> }
  | { type: 'UPDATE_SECURITY'; payload: Partial<SecuritySettings> }
  | { type: 'START_PASSWORD_CHANGE' }
  | { type: 'COMPLETE_PASSWORD_CHANGE' }
  | { type: 'START_2FA_TOGGLE' }
  | { type: 'COMPLETE_2FA_TOGGLE'; enabled: boolean }
  | { type: 'SHOW_DELETE_DIALOG'; show: boolean }
  | { type: 'SET_CONFIRMATION_TEXT'; text: string }
  | { type: 'START_DELETION' }
  | { type: 'COMPLETE_DELETION' }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_ACTIVE_SECTION'; section: DashboardSettingsState['ui']['activeSection'] };

export const createInitialState = (
  user: DashboardUser | null
): DashboardSettingsState => ({
  settings: {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      bookingUpdates: true,
      securityAlerts: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: true,
      activityStatus: false,
      allowMessages: true,
      showBookingHistory: true,
      shareWishlist: false,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true,
      deviceTracking: true,
    },
  },
  ui: {
    isChangingPassword: false,
    isEnabling2FA: false,
    showDeleteDialog: false,
    confirmationText: '',
    isDeleting: false,
    activeSection: null,
  },
  meta: {
    hasChanges: false,
    lastSaved: null,
    errors: {},
  },
});

export const dashboardSettingsReducer = (
  state: DashboardSettingsState,
  action: DashboardSettingsAction
): DashboardSettingsState => {
  switch (action.type) {
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        settings: {
          ...state.settings,
          notifications: {
            ...state.settings.notifications,
            ...action.payload,
          },
        },
        meta: {
          ...state.meta,
          hasChanges: true,
        },
      };

    case 'UPDATE_PRIVACY':
      return {
        ...state,
        settings: {
          ...state.settings,
          privacy: {
            ...state.settings.privacy,
            ...action.payload,
          },
        },
        meta: {
          ...state.meta,
          hasChanges: true,
        },
      };

    case 'UPDATE_SECURITY':
      return {
        ...state,
        settings: {
          ...state.settings,
          security: {
            ...state.settings.security,
            ...action.payload,
          },
        },
        meta: {
          ...state.meta,
          hasChanges: true,
        },
      };

    case 'START_PASSWORD_CHANGE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isChangingPassword: true,
        },
      };

    case 'COMPLETE_PASSWORD_CHANGE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isChangingPassword: false,
        },
      };

    case 'START_2FA_TOGGLE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isEnabling2FA: true,
        },
      };

    case 'COMPLETE_2FA_TOGGLE':
      return {
        ...state,
        settings: {
          ...state.settings,
          security: {
            ...state.settings.security,
            twoFactorEnabled: action.enabled,
          },
        },
        ui: {
          ...state.ui,
          isEnabling2FA: false,
        },
      };

    case 'SHOW_DELETE_DIALOG':
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteDialog: action.show,
          confirmationText: action.show ? state.ui.confirmationText : '',
        },
      };

    case 'SET_CONFIRMATION_TEXT':
      return {
        ...state,
        ui: {
          ...state.ui,
          confirmationText: action.text,
        },
      };

    case 'START_DELETION':
      return {
        ...state,
        ui: {
          ...state.ui,
          isDeleting: true,
        },
      };

    case 'COMPLETE_DELETION':
      return {
        ...state,
        ui: {
          ...state.ui,
          isDeleting: false,
          showDeleteDialog: false,
          confirmationText: '',
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        meta: {
          ...state.meta,
          errors: {
            ...state.meta.errors,
            [action.field]: action.error,
          },
        },
      };

    case 'CLEAR_ERROR':
      const { [action.field]: _, ...remainingErrors } = state.meta.errors;
      return {
        ...state,
        meta: {
          ...state.meta,
          errors: remainingErrors,
        },
      };

    case 'MARK_SAVED':
      return {
        ...state,
        meta: {
          ...state.meta,
          hasChanges: false,
          lastSaved: new Date(),
        },
      };

    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeSection: action.section,
        },
      };

    default:
      return state;
  }
};
```

**Success Criteria**:
- ✓ Single unified state structure
- ✓ All transitions through reducer
- ✓ Discriminated union actions
- ✓ Comprehensive reducer tests

#### Task 3.2: Extract Settings Configuration (2h)
**Assigned to**: Senior Dev 2
**Deliverables**:
```typescript
// File: /components/dashboard/components/settingsConfig.ts

import { Mail, Bell, Phone, Shield, MessageSquare, Eye, Globe, User, Key, Smartphone, Monitor } from 'lucide-react';

export type SettingOption = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  enabled: boolean;
  recommended?: boolean;
  warning?: boolean;
};

// Pure function: Generate notification options
export const getNotificationOptions = (
  settings: NotificationSettings
): SettingOption[] => [
  {
    id: 'emailNotifications',
    icon: Mail,
    title: 'Email Notifications',
    description: 'Booking confirmations, cancellations, and important updates',
    enabled: settings.emailNotifications,
    recommended: true,
  },
  {
    id: 'pushNotifications',
    icon: Bell,
    title: 'Push Notifications',
    description: 'Real-time alerts on your mobile device',
    enabled: settings.pushNotifications,
    recommended: true,
  },
  {
    id: 'smsNotifications',
    icon: Phone,
    title: 'SMS Notifications',
    description: 'Urgent booking updates via text message',
    enabled: settings.smsNotifications,
    recommended: false,
  },
  {
    id: 'bookingUpdates',
    icon: Bell,
    title: 'Booking Updates',
    description: 'Status changes, check-in reminders, and host messages',
    enabled: settings.bookingUpdates,
    recommended: true,
  },
  {
    id: 'securityAlerts',
    icon: Shield,
    title: 'Security Alerts',
    description: 'Login attempts, password changes, and suspicious activity',
    enabled: settings.securityAlerts,
    recommended: true,
  },
  {
    id: 'marketingEmails',
    icon: MessageSquare,
    title: 'Marketing Emails',
    description: 'Special offers, promotions, and travel inspiration',
    enabled: settings.marketingEmails,
    recommended: false,
  },
  {
    id: 'weeklyDigest',
    icon: Mail,
    title: 'Weekly Digest',
    description: 'Summary of your activity, new recommendations, and updates',
    enabled: settings.weeklyDigest,
    recommended: false,
  },
];

// Pure function: Generate privacy options
export const getPrivacyOptions = (
  settings: PrivacySettings
): SettingOption[] => [
  {
    id: 'profileVisibility',
    icon: Eye,
    title: 'Profile Visibility',
    description: 'Show your profile information to hosts and other users',
    enabled: settings.profileVisibility,
    warning: false,
  },
  {
    id: 'activityStatus',
    icon: Globe,
    title: 'Activity Status',
    description: "Show when you're online or recently active",
    enabled: settings.activityStatus,
    warning: false,
  },
  {
    id: 'allowMessages',
    icon: MessageSquare,
    title: 'Allow Messages',
    description: 'Let hosts and other users send you direct messages',
    enabled: settings.allowMessages,
    warning: false,
  },
  {
    id: 'showBookingHistory',
    icon: User,
    title: 'Show Booking History',
    description: 'Display your past bookings and reviews on your profile',
    enabled: settings.showBookingHistory,
    warning: false,
  },
  {
    id: 'shareWishlist',
    icon: Eye,
    title: 'Share Wishlist',
    description: 'Allow others to see your saved properties and favorites',
    enabled: settings.shareWishlist,
    warning: false,
  },
];

// Pure function: Generate security items
export const getSecurityItems = (
  settings: SecuritySettings,
  loadingStates: {
    isChangingPassword: boolean;
    isEnabling2FA: boolean;
  }
) => [
  {
    id: 'password',
    icon: Key,
    title: 'Password',
    description: 'Last updated 3 months ago',
    action: 'change-password' as const,
    actionLabel: 'Change Password',
    status: 'success' as const,
    loading: loadingStates.isChangingPassword,
  },
  {
    id: '2fa',
    icon: Smartphone,
    title: 'Two-Factor Authentication',
    description: settings.twoFactorEnabled
      ? 'Extra security is enabled for your account'
      : 'Not enabled - Add extra security to your account',
    action: (settings.twoFactorEnabled ? 'disable-2fa' : 'enable-2fa') as const,
    actionLabel: settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA',
    status: (settings.twoFactorEnabled ? 'success' : 'warning') as const,
    loading: loadingStates.isEnabling2FA,
  },
  {
    id: 'sessions',
    icon: Monitor,
    title: 'Login Activity',
    description: 'View and manage your recent login sessions',
    action: 'view-sessions' as const,
    actionLabel: 'View Activity',
    status: 'neutral' as const,
    loading: false,
  },
];

// Pure function: Get status colors
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'bg-green-100';
    case 'warning':
      return 'bg-yellow-100';
    case 'error':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

export const getStatusIconColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};
```

**Success Criteria**:
- ✓ All configuration as pure data
- ✓ Pure functions for option generation
- ✓ Type-safe configuration
- ✓ Unit tests for config functions

### Afternoon Session (4h) - Reusable Settings Components

#### Task 3.3: Create Generic SettingsSection (2h)
**Assigned to**: Senior Dev 3
**Deliverables**:
```typescript
// File: /components/dashboard/components/SettingsSection.tsx

type SettingsSectionRenderProps<T> = {
  settings: T;
  onUpdate: (updates: Partial<T>) => void;
  isLoading: boolean;
};

type SettingsSectionProps<T> = {
  title: string;
  icon: React.ComponentType<any>;
  settings: T;
  getOptions: (settings: T) => SettingOption[];
  onUpdate: (updates: Partial<T>) => void;
  isLoading?: boolean;
};

export function SettingsSection<T>({
  title,
  icon: Icon,
  settings,
  getOptions,
  onUpdate,
  isLoading = false,
}: SettingsSectionProps<T>) {
  const options = useMemo(() => getOptions(settings), [settings, getOptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {options.map(({ id, icon: OptionIcon, title, description, enabled, recommended, warning }) => (
          <div key={id} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <OptionIcon className="w-4 h-4 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{title}</p>
                  {recommended && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Recommended
                    </Badge>
                  )}
                  {warning && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-6">{description}</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => onUpdate({ [id]: checked } as Partial<T>)}
              disabled={isLoading}
              aria-label={`Toggle ${title}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Success Criteria**:
- ✓ Generic reusable component
- ✓ Render props pattern
- ✓ Type-safe
- ✓ Fully tested

#### Task 3.4: Performance Optimization (2h)
**Assigned to**: Senior Dev 4
**Deliverables**:
- Memoize all option generators
- Implement React.memo on sections
- Add useMemo/useCallback where needed
- Performance benchmarks before/after

**Success Criteria**:
- ✓ No unnecessary re-renders
- ✓ Options memoized
- ✓ Event handlers stable
- ✓ Performance improved

---

## DAY 4: DASHBOARDSETTINGS REFACTORING (Phase 2)

**Goal**: Complete DashboardSettings with all sections
**Duration**: 8 hours

### Morning Session (4h) - Complete All Sections

#### Task 4.1: Refactor Main Component (3h)
**Assigned to**: Senior Dev 1
**Deliverables**:
- Main component using unified reducer
- All sections using SettingsSection component
- Proper error handling
- Loading states

#### Task 4.2: Security & Danger Zone (1h)
**Assigned to**: Senior Dev 5
**Deliverables**:
- SecuritySettingsSection refactored
- DangerZoneSection refactored
- Confirmation dialog improvements

### Afternoon Session (4h) - Testing & Documentation

#### Task 4.3: Comprehensive Testing (3h)
**Assigned to**: Senior Dev 6
**Deliverables**:
- Reducer state machine tests (40+ tests)
- Component integration tests
- Settings update flow tests
- Error handling tests
- Coverage report (90%+ target)

#### Task 4.4: Code Review & Documentation (1h)
**Assigned to**: All team
**Deliverables**:
- Code review session
- JSDoc documentation
- Usage examples
- Migration guide

**Success Criteria**:
- ✓ 717 lines → ~300 lines (58% reduction)
- ✓ Single useReducer
- ✓ Reusable components
- ✓ 90%+ test coverage

---

## DAY 5: SEARCHBARCORE REFACTORING

**Goal**: Eliminate layout duplication with data-driven config
**Duration**: 8 hours

### Morning Session (4h) - Layout Configuration

#### Task 5.1: Extract Layout Config (2h)
**Assigned to**: Senior Dev 2
**Deliverables**:
```typescript
// File: /components/search/searchBarLayouts.ts

export type LayoutConfig = {
  container: {
    className: string;
    maxWidth: string;
  };
  form: {
    className: string;
    orientation: 'horizontal' | 'vertical';
  };
  fields: {
    showLabels: boolean;
    showPopups: boolean;
    spacing: string;
  };
  display: {
    dateFormat: 'full' | 'compact';
    guestFormat: 'full' | 'short';
  };
  popup: {
    position: {
      location: 'left' | 'center' | 'right';
      dates: 'left' | 'center' | 'right';
      guests: 'left' | 'center' | 'right';
    };
  };
};

export const layoutConfigs: Record<SearchBarLayout, LayoutConfig> = {
  hero: {
    container: {
      className: 'searchbar bg-white rounded-full shadow-xl hover:shadow-2xl mx-auto transition-all duration-300',
      maxWidth: 'max-w-4xl',
    },
    form: {
      className: 'flex flex-col lg:flex-row items-stretch lg:items-center',
      orientation: 'horizontal',
    },
    fields: {
      showLabels: true,
      showPopups: false,
      spacing: 'border-r border-gray-200',
    },
    display: {
      dateFormat: 'full',
      guestFormat: 'full',
    },
    popup: {
      position: {
        location: 'left',
        dates: 'center',
        guests: 'right',
      },
    },
  },
  header: {
    container: {
      className: 'searchbar bg-white rounded-full shadow-md hover:shadow-lg w-full transition-all duration-300',
      maxWidth: 'max-w-3xl',
    },
    form: {
      className: 'flex items-center h-12',
      orientation: 'horizontal',
    },
    fields: {
      showLabels: false,
      showPopups: true,
      spacing: 'w-px h-5 bg-gray-300',
    },
    display: {
      dateFormat: 'compact',
      guestFormat: 'short',
    },
    popup: {
      position: {
        location: 'left',
        dates: 'center',
        guests: 'right',
      },
    },
  },
  compact: {
    container: {
      className: 'searchbar space-y-4',
      maxWidth: '',
    },
    form: {
      className: 'space-y-4',
      orientation: 'vertical',
    },
    fields: {
      showLabels: true,
      showPopups: false,
      spacing: '',
    },
    display: {
      dateFormat: 'full',
      guestFormat: 'full',
    },
    popup: {
      position: {
        location: 'left',
        dates: 'left',
        guests: 'left',
      },
    },
  },
};

export const getLayoutConfig = (layout: SearchBarLayout): LayoutConfig =>
  layoutConfigs[layout];
```

#### Task 5.2: Create Pure Render Functions (2h)
**Assigned to**: Senior Dev 5
**Deliverables**:
- `renderSearchField` pure function
- `renderSearchForm` pure function
- `renderSearchPopups` pure function
- All layout-specific rendering extracted

### Afternoon Session (4h) - Assembly & Testing

#### Task 5.3: Popup HOC Implementation (2h)
**Assigned to**: Senior Dev 3
**Deliverables**:
```typescript
// File: /components/search/withPopup.tsx

type WithPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'center' | 'right';
};

export function withPopup<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithPopupComponent({
    isOpen,
    onClose,
    position,
    ...props
  }: P & WithPopupProps) {
    if (!isOpen) return null;

    const positionClasses = {
      left: 'left-0',
      center: 'left-1/4',
      right: 'right-0',
    };

    return (
      <div className={`absolute top-full mt-2 z-50 ${positionClasses[position]}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
          <Component {...(props as P)} />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };
}

// Create wrapped components
export const LocationPopup = withPopup(LocationInput);
export const DatePickerPopup = withPopup(UnifiedDatePicker);
export const GuestSelectorPopup = withPopup(GuestSelector);
```

#### Task 5.4: Testing & Benchmarking (2h)
**Assigned to**: Senior Dev 6
**Deliverables**:
- Layout configuration tests
- Render function tests
- Integration tests
- Performance comparison
- Coverage report

**Success Criteria**:
- ✓ 502 lines → ~180 lines (64% reduction)
- ✓ Zero layout duplication
- ✓ Data-driven configuration
- ✓ Reusable popup HOC
- ✓ 85%+ test coverage

---

## FINAL DELIVERABLES

### Code Metrics

**Before Refactoring**:
- PropertyCard: 486 lines
- DashboardSettings: 717 lines
- SearchBarCore: 502 lines
- **Total**: 1,705 lines

**After Refactoring**:
- PropertyCard: ~200 lines (59% reduction)
- DashboardSettings: ~300 lines (58% reduction)
- SearchBarCore: ~180 lines (64% reduction)
- **Total**: ~680 lines (60% average reduction)

### Test Coverage

- Pure Functions: 95%+ coverage
- Reducers: 90%+ coverage
- Components: 85%+ coverage
- Integration: 80%+ coverage
- **Overall**: 90%+ coverage

### Documentation

- JSDoc comments on all exports
- Usage examples for all patterns
- Migration guide for each component
- Performance benchmarks
- Architecture decision records

---

## RISK MITIGATION

### Daily Checkpoints

**Each day at 12:00 PM and 5:00 PM**:
- Progress review
- Blocker identification
- Task reallocation if needed

### Contingency Plans

**If tasks overrun**:
- Reallocate resources from completed tasks
- Defer non-critical optimizations
- Pair programming on blockers

**If tests fail**:
- Stop feature work
- All hands on fixing tests
- No merging until green

### Quality Gates

**Before merging each component**:
- ✓ All tests passing
- ✓ 90%+ coverage
- ✓ Code review approved
- ✓ Performance benchmarks acceptable
- ✓ Documentation complete

---

## SUCCESS CRITERIA

**Week 2 Complete When**:
1. ✓ All three components refactored
2. ✓ 60% code reduction achieved
3. ✓ 90%+ test coverage
4. ✓ All tests passing
5. ✓ Documentation complete
6. ✓ Performance improved or maintained
7. ✓ Code review approved
8. ✓ Zero breaking changes

---

**Plan Prepared By**: Team C (6 Senior FP Developers)
**Estimated Completion**: End of Week 2
**Risk Level**: LOW (Detailed analysis complete)
**Confidence Level**: HIGH (95%)
