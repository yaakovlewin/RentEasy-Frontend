/**
 * COMPONENT COMPOSITION PATTERN TEMPLATE
 *
 * This template demonstrates advanced composition patterns for building
 * complex components from simple, reusable pieces following FP principles.
 *
 * Key Concepts:
 * - Composition over inheritance
 * - Higher-Order Components (HOCs)
 * - Component composition functions
 * - Compound components pattern
 * - Slot pattern for flexible layouts
 * - Pure component builders
 *
 * Use Cases:
 * - Building complex UI from simple parts
 * - Creating flexible, configurable components
 * - Sharing cross-cutting concerns
 * - Layout composition
 */

import React, { createContext, useContext, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// HIGHER-ORDER COMPONENT (HOC) PATTERNS
// =============================================================================

/**
 * HOC: Add loading state to any component
 */
type WithLoadingProps = {
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
};

export function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent({
    isLoading,
    loadingComponent = <div>Loading...</div>,
    ...props
  }: P & WithLoadingProps) {
    if (isLoading) {
      return <>{loadingComponent}</>;
    }

    return <Component {...(props as P)} />;
  };
}

// Usage:
/*
const PropertyCardWithLoading = withLoading(PropertyCard);

<PropertyCardWithLoading
  {...propertyProps}
  isLoading={isLoading}
  loadingComponent={<PropertyCardSkeleton />}
/>
*/

/**
 * HOC: Add error boundary to any component
 */
type WithErrorBoundaryProps = {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  defaultFallback?: React.ReactNode
) {
  return function WithErrorBoundaryComponent({
    fallback = defaultFallback,
    onError,
    ...props
  }: P & WithErrorBoundaryProps) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...(props as P)} />
      </ErrorBoundary>
    );
  };
}

// Simple error boundary implementation
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

/**
 * HOC: Add analytics tracking to any component
 */
type WithAnalyticsProps = {
  trackingId?: string;
  trackingEvent?: string;
};

export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  defaultEvent?: string
) {
  return function WithAnalyticsComponent({
    trackingId,
    trackingEvent = defaultEvent,
    ...props
  }: P & WithAnalyticsProps) {
    const handleClick = (e: React.MouseEvent) => {
      if (trackingEvent && trackingId) {
        // Track event
        console.log('Track:', trackingEvent, trackingId);
      }
    };

    return (
      <div onClick={handleClick}>
        <Component {...(props as P)} />
      </div>
    );
  };
}

/**
 * HOC Composition Helper
 * Compose multiple HOCs into a single HOC
 */
export const compose =
  <P extends object>(...hocs: Array<(Component: React.ComponentType<P>) => React.ComponentType<P>>) =>
  (Component: React.ComponentType<P>): React.ComponentType<P> =>
    hocs.reduceRight((acc, hoc) => hoc(acc), Component);

// Usage:
/*
const EnhancedPropertyCard = compose(
  withLoading,
  withErrorBoundary,
  withAnalytics
)(PropertyCard);

<EnhancedPropertyCard
  {...propertyProps}
  isLoading={isLoading}
  trackingId="property-123"
  trackingEvent="property_view"
/>
*/

// =============================================================================
// COMPOUND COMPONENTS PATTERN
// =============================================================================

/**
 * Compound Component: Card with subcomponents
 * Provides shared context to all subcomponents
 */
type CardContextValue = {
  variant: 'default' | 'elevated' | 'outlined';
  padding: 'none' | 'sm' | 'md' | 'lg';
};

const CardContext = createContext<CardContextValue | null>(null);

const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('Card subcomponents must be used within Card');
  }
  return context;
};

type CardProps = {
  variant?: CardContextValue['variant'];
  padding?: CardContextValue['padding'];
  className?: string;
  children: React.ReactNode;
};

export const Card = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
}: CardProps) => {
  const contextValue = useMemo(() => ({ variant, padding }), [variant, padding]);

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-300',
  };

  return (
    <CardContext.Provider value={contextValue}>
      <div className={cn('rounded-lg', variantClasses[variant], className)}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

// Card subcomponents
type CardHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

Card.Header = ({ className, children }: CardHeaderProps) => {
  const { padding } = useCardContext();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(paddingClasses[padding], 'border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

type CardBodyProps = {
  className?: string;
  children: React.ReactNode;
};

Card.Body = ({ className, children }: CardBodyProps) => {
  const { padding } = useCardContext();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return <div className={cn(paddingClasses[padding], className)}>{children}</div>;
};

type CardFooterProps = {
  className?: string;
  children: React.ReactNode;
};

Card.Footer = ({ className, children }: CardFooterProps) => {
  const { padding } = useCardContext();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(paddingClasses[padding], 'border-t border-gray-200', className)}>
      {children}
    </div>
  );
};

// Usage:
/*
<Card variant="elevated" padding="lg">
  <Card.Header>
    <h2>Property Details</h2>
  </Card.Header>
  <Card.Body>
    <p>Property information here</p>
  </Card.Body>
  <Card.Footer>
    <button>Book Now</button>
  </Card.Footer>
</Card>
*/

// =============================================================================
// SLOT PATTERN
// =============================================================================

/**
 * Slot Pattern: Flexible layout with named slots
 */
type LayoutSlots = {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

type LayoutProps = LayoutSlots & {
  className?: string;
  showSidebar?: boolean;
};

export const Layout: React.FC<LayoutProps> = ({
  header,
  sidebar,
  content,
  footer,
  className,
  showSidebar = true,
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header Slot */}
      {header && <header className="bg-white border-b">{header}</header>}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar Slot */}
        {showSidebar && sidebar && (
          <aside className="w-64 bg-gray-50 border-r">{sidebar}</aside>
        )}

        {/* Content Slot */}
        <main className="flex-1 p-6">{content}</main>
      </div>

      {/* Footer Slot */}
      {footer && <footer className="bg-gray-50 border-t">{footer}</footer>}
    </div>
  );
};

// Usage:
/*
<Layout
  header={<Navigation />}
  sidebar={<DashboardMenu />}
  content={<PropertyList />}
  footer={<Footer />}
  showSidebar={true}
/>
*/

// =============================================================================
// COMPONENT BUILDER PATTERN
// =============================================================================

/**
 * Builder Pattern: Fluent API for component construction
 */
class PropertyCardBuilder {
  private config: {
    showImage: boolean;
    showHost: boolean;
    showAmenities: boolean;
    showPricing: boolean;
    showActions: boolean;
    variant: 'default' | 'compact' | 'expanded';
    imagePosition: 'top' | 'left' | 'right';
  } = {
    showImage: true,
    showHost: true,
    showAmenities: true,
    showPricing: true,
    showActions: true,
    variant: 'default',
    imagePosition: 'top',
  };

  withImage(show: boolean = true) {
    this.config.showImage = show;
    return this;
  }

  withHost(show: boolean = true) {
    this.config.showHost = show;
    return this;
  }

  withAmenities(show: boolean = true) {
    this.config.showAmenities = show;
    return this;
  }

  withPricing(show: boolean = true) {
    this.config.showPricing = show;
    return this;
  }

  withActions(show: boolean = true) {
    this.config.showActions = show;
    return this;
  }

  setVariant(variant: 'default' | 'compact' | 'expanded') {
    this.config.variant = variant;
    return this;
  }

  setImagePosition(position: 'top' | 'left' | 'right') {
    this.config.imagePosition = position;
    return this;
  }

  build(): React.ComponentType<any> {
    const config = this.config;

    return function PropertyCard(props: any) {
      return (
        <div className={cn('property-card', `variant-${config.variant}`)}>
          {config.showImage && <div className="image">Image</div>}
          <div className="content">
            <h3>{props.title}</h3>
            {config.showHost && <div className="host">Host: {props.host}</div>}
            {config.showAmenities && <div className="amenities">Amenities</div>}
            {config.showPricing && <div className="pricing">${props.price}</div>}
          </div>
          {config.showActions && (
            <div className="actions">
              <button>View</button>
              <button>Book</button>
            </div>
          )}
        </div>
      );
    };
  }
}

// Usage:
/*
const CompactPropertyCard = new PropertyCardBuilder()
  .setVariant('compact')
  .withImage(true)
  .withHost(false)
  .withAmenities(false)
  .withActions(false)
  .build();

<CompactPropertyCard title="Beach House" price={150} />
*/

// =============================================================================
// FUNCTION COMPOSITION PATTERNS
// =============================================================================

/**
 * Pure function composition for component rendering
 */
type RenderFunction<P> = (props: P) => JSX.Element;

/**
 * Compose render functions
 */
export const composeRenderers =
  <P extends object>(...renderers: RenderFunction<P>[]) =>
  (props: P): JSX.Element => (
    <>
      {renderers.map((renderer, index) => (
        <React.Fragment key={index}>{renderer(props)}</React.Fragment>
      ))}
    </>
  );

// Example render functions
const renderHeader = ({ title }: { title: string }) => (
  <h1 className="text-2xl font-bold">{title}</h1>
);

const renderContent = ({ content }: { content: string }) => (
  <div className="prose">{content}</div>
);

const renderFooter = ({ author }: { author: string }) => (
  <div className="text-sm text-gray-600">By {author}</div>
);

// Compose into single component
const ArticleRenderer = composeRenderers(renderHeader, renderContent, renderFooter);

// Usage:
/*
<ArticleRenderer
  title="My Article"
  content="Article content..."
  author="John Doe"
/>
*/

// =============================================================================
// CONDITIONAL COMPOSITION PATTERN
// =============================================================================

/**
 * Conditional component composition based on props
 */
type ConditionalWrapperProps = {
  condition: boolean;
  wrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
};

export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  wrapper,
  children,
}) => (condition ? wrapper(children) : <>{children}</>);

// Usage:
/*
<ConditionalWrapper
  condition={isLoggedIn}
  wrapper={(children) => <AuthenticatedLayout>{children}</AuthenticatedLayout>}
>
  <DashboardContent />
</ConditionalWrapper>
*/

// =============================================================================
// RENDER ARRAY PATTERN
// =============================================================================

/**
 * Compose components from array configuration
 */
type ComponentConfig = {
  id: string;
  component: React.ComponentType<any>;
  props: any;
  condition?: boolean;
};

type ComposedLayoutProps = {
  components: ComponentConfig[];
  className?: string;
};

export const ComposedLayout: React.FC<ComposedLayoutProps> = ({
  components,
  className,
}) => {
  return (
    <div className={className}>
      {components
        .filter((config) => config.condition !== false)
        .map((config) => {
          const Component = config.component;
          return <Component key={config.id} {...config.props} />;
        })}
    </div>
  );
};

// Usage:
/*
const dashboardComponents: ComponentConfig[] = [
  {
    id: 'stats',
    component: StatsOverview,
    props: { stats: userStats },
  },
  {
    id: 'bookings',
    component: BookingsList,
    props: { bookings: userBookings },
    condition: hasBookings,
  },
  {
    id: 'favorites',
    component: FavoritesList,
    props: { favorites: userFavorites },
    condition: hasFavorites,
  },
];

<ComposedLayout components={dashboardComponents} />
*/

// =============================================================================
// PROVIDER COMPOSITION PATTERN
// =============================================================================

/**
 * Compose multiple context providers
 */
type ProviderConfig = {
  provider: React.ComponentType<{ children: React.ReactNode }>;
  props?: any;
};

type ProviderComposerProps = {
  providers: ProviderConfig[];
  children: React.ReactNode;
};

export const ProviderComposer: React.FC<ProviderComposerProps> = ({
  providers,
  children,
}) => {
  return providers.reduceRight(
    (acc, { provider: Provider, props = {} }) => (
      <Provider {...props}>{acc}</Provider>
    ),
    children
  );
};

// Usage:
/*
const providers: ProviderConfig[] = [
  { provider: AuthProvider },
  { provider: ThemeProvider, props: { theme: 'dark' } },
  { provider: SearchProvider },
];

<ProviderComposer providers={providers}>
  <App />
</ProviderComposer>

// Instead of:
<AuthProvider>
  <ThemeProvider theme="dark">
    <SearchProvider>
      <App />
    </SearchProvider>
  </ThemeProvider>
</AuthProvider>
*/

// =============================================================================
// MEMOIZED COMPOSITION PATTERN
// =============================================================================

/**
 * Create memoized composite component
 */
type CompositeComponentProps = {
  parts: Array<{
    component: React.ComponentType<any>;
    props: any;
    key: string;
  }>;
  className?: string;
};

export const CompositeComponent = memo<CompositeComponentProps>(
  ({ parts, className }) => {
    return (
      <div className={className}>
        {parts.map(({ component: Component, props, key }) => (
          <Component key={key} {...props} />
        ))}
      </div>
    );
  }
);

// Usage:
/*
const propertyCardParts = [
  { component: PropertyImage, props: { images }, key: 'image' },
  { component: PropertyInfo, props: { property }, key: 'info' },
  { component: PropertyPricing, props: { price }, key: 'pricing' },
];

<CompositeComponent parts={propertyCardParts} />
*/

// =============================================================================
// EXPORT ALL PATTERNS
// =============================================================================

export default {
  // HOCs
  withLoading,
  withErrorBoundary,
  withAnalytics,
  compose,

  // Compound Components
  Card,

  // Layouts
  Layout,
  ConditionalWrapper,
  ComposedLayout,

  // Providers
  ProviderComposer,

  // Utilities
  composeRenderers,
  CompositeComponent,
};
