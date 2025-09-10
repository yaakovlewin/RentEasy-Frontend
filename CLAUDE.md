# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend code in this repository.

## Project Overview

RentEasy is a holiday rental platform with a **staff-facilitated matching service** business model. Unlike traditional platforms where users browse properties themselves, RentEasy provides personalized matching services where staff review guest preferences and manually match them with suitable properties.

This frontend provides the user interface for the RentEasy platform with enterprise-grade architecture and modern development practices.

## Architecture

This is a full-stack TypeScript application with:
- **Backend**: Node.js/Express API located in `Back end/` directory
- **Frontend**: Next.js application in `Front end/` directory (enterprise-grade architecture)
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based with role-based access control (guest, owner, staff, admin)

### Key Frontend Components

- **Pages**: App Router pages in `src/app/` directory
- **Components**: Reusable UI components in `src/components/`
- **API Client**: Enterprise-grade unified API architecture in `src/lib/api/`
- **Utilities**: Organized utility functions in `src/lib/utils/`
- **Contexts**: React Context providers in `src/contexts/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Styles**: Global styles and Tailwind configuration

## Common Development Commands

All commands should be run from the `Front end/` directory:

```bash
# Essential commands
npm run dev          # Start development server
npm run build        # Build for production  
npm test            # Run tests
npm run lint        # Run linting and type checking
```

See `package.json` for additional commands including testing, formatting, and deployment options.

## Key Features & Architecture Patterns

### Frontend Security Implementation
- JWT token management with automatic refresh and secure storage
- Request/response interceptors for authentication handling
- Structured error handling to prevent information leakage
- Input validation with TypeScript interfaces and runtime checks
- Environment variable protection (API keys, configurations)

### Performance Optimizations
- Intelligent API caching with TTL and tag-based invalidation (5-30min TTL default)
- Request deduplication to prevent duplicate API calls
- Next.js Image optimization with WebP/AVIF formats
- Code splitting and lazy loading with Next.js App Router
- Bundle optimization with tree shaking and compression

### API Client Architecture
- Unified API client with consolidated architecture
- Domain-specific clients (Auth, Properties, Bookings) with clean interfaces
- Automatic retry logic with exponential backoff
- Request/response transformation (camelCase ↔ snake_case)
- Comprehensive error handling with recovery strategies

### Component Architecture
- Modern React patterns with TypeScript strict mode
- shadcn/ui component library with consistent design system
- Context API for global state (AuthContext, SearchContext)
- Custom hooks for reusable logic and API integration
- **Enterprise-grade error boundaries** with layered protection and recovery strategies

### Testing Strategy
- Jest + React Testing Library with comprehensive coverage requirements
- Unit tests for components, utilities, and API clients
- Integration tests for user flows and API interactions
- Comprehensive mocking for Next.js, APIs, and browser features

## 🎯 Modern API Architecture

### **Enterprise-Grade API System**

The frontend uses a **unified API architecture** with domain-specific clients:

```typescript
import { api } from '@/lib/api'

// Authentication
const user = await api.auth.login(email, password)
const isAuth = api.isAuthenticated()

// Properties and Bookings
const properties = await api.properties.searchProperties(searchParams)
const booking = await api.bookings.createBooking(bookingData)
```

### **API Architecture Structure**

- **Core Services**: TokenManager, DataTransformer, HttpClient in `/lib/api/core/`
- **Supporting Services**: ApiCache, ApiMonitor, ApiErrors in `/lib/api/services/`
- **Domain Clients**: Auth, Properties, Bookings clients in `/lib/api/clients/`
- **Single Entry Point**: `/lib/api.ts` exports all functionality

### **Key Features**

✅ **Single Source of Truth**: One `import { api } from '@/lib/api'`
✅ **Zero Breaking Changes**: All existing components continue working
✅ **Enterprise Features**: Caching, monitoring, structured errors
✅ **Full TypeScript**: Complete type safety with generics
✅ **Performance Optimized**: Request deduplication, intelligent caching
✅ **Production Ready**: ✓ Build passes, zero runtime errors
✅ **Clean Architecture**: SOLID principles, separation of concerns
✅ **Comprehensive Testing**: 200+ test cases covering all scenarios

## 🛡️ Enterprise Error Boundary System

### **Comprehensive Error Protection**

The frontend features an **enterprise-grade error boundary system** that ensures graceful error handling:

```typescript
// Import error boundary components
import { FeatureErrorBoundary, withErrorBoundary, useErrorMonitoring } from '@/components/error-boundaries'

// Wrap features with appropriate error boundaries
<FeatureErrorBoundary featureName="Property Search" level="high">
  <PropertySearchComponent />
</FeatureErrorBoundary>

// Use HOC for component protection
const SafeComponent = withErrorBoundary(MyComponent)
```

### **Error Boundary Architecture**

The system provides layered error protection:

- **Next.js Error Pages**: `global-error.tsx`, `error.tsx`, `not-found.tsx`, route-specific error pages
- **Error Boundary Components**: Global, Context, Route, API, Feature, and Async boundaries in `/components/error-boundaries/`
- **Error Monitoring**: Enterprise monitoring service in `/lib/error-monitoring/`

### **Error Boundary Coverage Levels**

| **Level** | **Component** | **Use Case** | **Recovery Strategy** |
|-----------|---------------|--------------|----------------------|
| **Critical** | GlobalErrorBoundary | Application-wide protection | Page reload, external service notification |
| **App** | error.tsx | Layout-level errors | Navigation options, retry mechanisms |
| **Context** | ContextErrorBoundary | Provider isolation (Auth, Search) | Context reset, fallback state |
| **Route** | Route error pages | Page-specific errors | Route recovery, navigation alternatives |
| **Feature** | FeatureErrorBoundary | Feature isolation | Feature fallback, graceful degradation |
| **Component** | AsyncComponentBoundary | Component-level errors | Component retry, loading states |

### **Enterprise Error Monitoring**

```typescript
import { captureError, trackPerformance, ErrorSeverity, ErrorCategory } from '@/lib/error-monitoring'

// Capture structured errors with context
captureError(error, ErrorSeverity.HIGH, ErrorCategory.API, contextData)

// Track performance metrics  
trackPerformance('operation-name', duration)
```

**Key Features:**
- ✅ **Error Classification**: 4 severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ **Error Categorization**: 7 categories (NETWORK, API, COMPONENT, AUTH, etc.)
- ✅ **Recovery Strategies**: Retry, fallback, redirect, ignore with configurable policies
- ✅ **Production Integration**: Ready for Sentry, LogRocket, or custom monitoring
- ✅ **Performance Tracking**: Built-in metrics and monitoring
- ✅ **Context Preservation**: Maintains user session during error recovery

## Component Architecture

### **Layout Components** (`/components/layout/`)
- **Header.tsx**: Main application header
- **Footer.tsx**: Application footer
- **DynamicHeader.tsx**: Context-aware header
- **DynamicLayout.tsx**: Responsive layout wrapper

### **UI Components** (`/components/ui/`)
- Built on **shadcn/ui** components
- **ErrorDisplay.tsx**: Structured error display with recovery
- **Loading.tsx**: Consistent loading states
- **Button.tsx**, **Card.tsx**, etc.: Reusable UI primitives

### **Feature Components**
- **Authentication** (`/components/auth/`): Login, register, profile
- **Properties** (`/components/property/`): Property cards, details, search
- **Search** (`/components/search/`): Advanced search functionality
- **Booking** (`/components/booking/`): Booking flow and management

## State Management

### **React Context API**
- **AuthContext**: User authentication and session management
- **SearchContext**: Search state and filters
- Located in `src/contexts/`

### **Modern Patterns**
- **Custom hooks** for reusable logic in `src/hooks/`
- **Server state** managed by API client with caching
- **Client state** managed by React hooks and Context API

## Utility Functions (`/lib/utils/`)

Organized utility functions with full TypeScript coverage:

```typescript
import { 
  cn,                    // className merging
  formatCurrency,        // Currency formatting
  formatDate,           // Date formatting with date-fns
  validateEmail,        // Input validation
  debounce             // Performance utilities
} from '@/lib/utils'
```

### **Utility Structure**
- **styling.ts**: className merging, responsive utilities
- **formatting.ts**: Date/currency/text formatting with date-fns
- **validation.ts**: Input validation helpers
- **cache.ts**: Enhanced request caching with TTL management
- **search.ts**: Search-specific utilities
- **index.ts**: Barrel exports for clean imports

## Environment Configuration

Required `.env.local` variables in `Front end/` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps (for property locations)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Build & Performance

### **Next.js Configuration** (`next.config.ts`)
- **Bundle analyzer**: Integrated for performance monitoring
- **Image optimization**: WebP/AVIF formats with proper device sizes
- **Security headers**: X-Frame-Options, CSP, referrer policy
- **Performance optimizations**: Code splitting, compression

### **TypeScript Configuration** (`tsconfig.json`)
- **Strict mode**: Enhanced type safety
- **Path mapping**: Clean imports with `@/` prefix
- **Modern target**: ES2022 for better performance

## Code Quality

### **ESLint + Prettier**
- **Consistent formatting**: Prettier with import sorting
- **Code quality**: ESLint with TypeScript rules
- **Pre-commit hooks**: Husky + lint-staged

### **Testing Strategy**
- **Unit tests**: Components and utilities
- **Integration tests**: User flows and API interactions
- **Test coverage**: High coverage standards with detailed reporting
- **Mocking**: Comprehensive mocks for Next.js, APIs, and browser APIs

## Important Notes

- The main frontend entry point is `src/app/layout.tsx` and `src/app/page.tsx`
- All API operations use the unified client via `import { api } from '@/lib/api'`
- Components are organized by feature with shared UI components in `/components/ui/`
- The app uses comprehensive error handling with structured error classes
- Authentication state is managed globally via AuthContext with automatic token refresh
- Performance monitoring available through API metrics and Next.js analytics
- The frontend is designed for staff-facilitated operations matching the backend business model
- All routes use Next.js App Router with proper TypeScript support

## Important Development Patterns

### **API Usage**
```typescript
// ✅ Correct: Use unified API
import { api } from '@/lib/api'

// ❌ Avoid: Direct axios or fetch calls
```

### **Error Handling**
```typescript
// ✅ Structured error handling
import { BaseApiError } from '@/lib/api'

try {
  await api.auth.login(email, password)
} catch (error) {
  if (error instanceof BaseApiError) {
    // Handle structured API error
    console.error(error.type, error.message)
  }
}
```

### **Component Patterns**
```typescript
// ✅ Proper TypeScript interfaces
interface PropertyCardProps {
  property: Property
  onSelect?: (property: Property) => void
}

// ✅ Use utility functions
import { cn, formatCurrency } from '@/lib/utils'
```

### **Error Boundary Patterns**
```typescript
// ✅ Feature-level protection
<FeatureErrorBoundary featureName="Search" level="high" enableRetry>
  <ComponentTree />
</FeatureErrorBoundary>

// ✅ Component wrapping with HOC
const SafeComponent = withErrorBoundary(Component, { onError: handleError })

// ✅ Context provider protection
<ContextErrorBoundary contextName="SearchProvider">
  <SearchProvider>
    <ChildComponents />
  </SearchProvider>
</ContextErrorBoundary>

// ✅ Error monitoring in try/catch
try {
  await api.call()
} catch (error) {
  captureError(error, ErrorSeverity.HIGH, ErrorCategory.API, context)
}
```

## Security Best Practices

- **Environment variables**: All sensitive data in `.env.local`
- **Token management**: Automatic refresh with secure storage
- **Input validation**: Client and server-side validation
- **Error handling**: Structured errors prevent information leakage
- **Security headers**: Comprehensive protection in Next.js config

## Performance Optimizations

- **API caching**: Intelligent caching with TTL and tag-based invalidation
- **Request deduplication**: Prevents duplicate API calls
- **Image optimization**: Next.js Image component with proper sizing
- **Code splitting**: Automatic chunking and lazy loading
- **Bundle analysis**: Built-in tools for monitoring bundle size

## Common Tasks

### **Adding a New API Endpoint**
1. Add method to appropriate client (`AuthClient`, `PropertiesClient`, `BookingsClient`)
2. Add TypeScript interfaces for request/response
3. Add comprehensive tests
4. Update API documentation

### **Creating a New Component**
1. Follow existing patterns in `/components/`
2. Use TypeScript interfaces for props
3. **Wrap with appropriate error boundaries** (FeatureErrorBoundary for features, withErrorBoundary HOC for components)
4. **Integrate error monitoring** for production error tracking
5. Add tests with React Testing Library
6. Use utility functions from `/lib/utils/`

### **Adding New Utilities**
1. Add to appropriate file in `/lib/utils/`
2. Export from `/lib/utils/index.ts`
3. Add comprehensive tests
4. Include JSDoc documentation

### **Implementing Error Boundaries**
1. **Choose appropriate error boundary level**:
   - `GlobalErrorBoundary` for application-wide protection
   - `ContextErrorBoundary` for context provider isolation
   - `FeatureErrorBoundary` for feature-level protection
   - `withErrorBoundary` HOC for individual component protection

2. **Add error monitoring integration**:
   ```typescript
   import { captureError, ErrorSeverity, ErrorCategory } from '@/lib/error-monitoring'
   
   captureError(error, ErrorSeverity.HIGH, ErrorCategory.COMPONENT, {
     featureName: 'property-search',
     componentName: 'PropertyCard',
     userId: user?.id
   })
   ```

3. **Implement recovery strategies**: Enable retry, fallback UI, or graceful degradation
4. **Add contextual error information** for debugging and monitoring
5. **Test error scenarios** with proper error boundary integration

## Development Patterns

### **Current Architecture Standards**
The frontend follows these established patterns:

- **API Integration**: Use unified API client via `import { api } from '@/lib/api'`
- **Error Handling**: Implement structured error boundaries and monitoring
- **Utilities**: Import clean utility functions from `/lib/utils/`
- **TypeScript**: Use comprehensive interfaces throughout
- **Component Design**: Follow consistent naming conventions and patterns

## Troubleshooting

### **Common Issues**

1. **Build failures**: Check TypeScript errors with `npm run typecheck`
2. **API errors**: Use browser dev tools to inspect network requests
3. **Environment variables**: Ensure all required variables are set
4. **Import errors**: Use `@/` prefix for internal imports

### **Development Tools**

- **React Developer Tools**: For debugging React components
- **Next.js DevTools**: For debugging Next.js specific features
- **Network tab**: For debugging API requests and caching
- **Source maps**: Enabled for debugging in development

## Documentation

- **API documentation**: See `/lib/api/` JSDoc comments
- **Component props**: TypeScript interfaces provide IntelliSense
- **Utility functions**: JSDoc documentation in `/lib/utils/`
- **Testing examples**: See `__tests__/` directories

---

## 🚀 **Key Achievements: Enterprise-Grade Architecture**

This frontend features **two major enterprise-grade systems**:

### 🎯 **World-Class API Architecture**
- **Consolidated multiple systems** into a single, unified API architecture
- **Improved developer experience** with clean, predictable APIs
- **Enhanced performance** with intelligent caching and request optimization
- **Ensured production reliability** with comprehensive test coverage
- **Maintained backward compatibility** during migration

### 🛡️ **Bulletproof Error Boundary System**
- **Comprehensive error boundary coverage** across all application layers
- **Specialized error boundaries** for different error scenarios
- **Enterprise-grade error monitoring** ready for production services
- **Route-specific error pages** for major application sections
- **Graceful error handling** - users always have recovery options
- **Complete user protection** with graceful degradation

**Result**: A **maintainable, performant, and bulletproof** developer and user experience! 🎯

---

**Important**: This frontend is production-ready with comprehensive testing, security measures, and performance optimizations. Always run tests and type checking before deploying changes.