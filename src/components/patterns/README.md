# FP Component Patterns - Template Library

This directory contains comprehensive templates for refactoring React components using Functional Programming (FP) principles. These templates serve as blueprints for the Week 2 refactoring implementation.

## Templates Overview

### 1. FunctionalComponent.template.tsx

**Purpose**: Core FP pattern for React components

**Key Features**:
- Pure render functions separated from side effects
- State management through reducers
- Immutable state transitions
- Curried event handlers
- Composition over inheritance

**Use When**:
- Refactoring components with complex state
- Converting imperative components to functional
- Building new components from scratch

**Example Pattern**:
```typescript
// Pure render functions
const renderHeader = (props) => <Header {...props} />;
const renderContent = (props) => <Content {...props} />;

// Container with reducer
const Component = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Side effects only
  useEffect(() => { ... }, []);

  // Delegate to pure functions
  return (
    <>
      {renderHeader({ ...props, ...state })}
      {renderContent({ ...props, ...state })}
    </>
  );
};
```

### 2. RenderProps.template.tsx

**Purpose**: Sharing logic between components via render props pattern

**Key Features**:
- Inversion of control through children as function
- Reusable stateful logic
- Type-safe render props
- Composable data providers

**Included Patterns**:
- `DataProvider` - Generic data fetching with loading/error states
- `FormStateProvider` - Complete form state management
- `ListManager` - CRUD operations for lists
- `Toggle` - Simple toggle state
- `PaginationProvider` - Pagination logic
- `SettingsSection` - Settings management

**Use When**:
- Need to share stateful logic without HOCs
- Building flexible, customizable components
- Creating reusable data/state providers

**Example Pattern**:
```typescript
<FormStateProvider
  initialValues={{ email: '', password: '' }}
  validationRules={{
    email: (value) => !value.includes('@') ? 'Invalid' : null
  }}
  onSubmit={handleSubmit}
>
  {({ values, errors, handleChange, handleSubmit }) => (
    <form onSubmit={handleSubmit}>
      <input value={values.email} onChange={handleChange('email')} />
      {errors.email && <span>{errors.email}</span>}
    </form>
  )}
</FormStateProvider>
```

### 3. ComponentComposition.template.tsx

**Purpose**: Building complex components from simple, reusable pieces

**Key Features**:
- Higher-Order Components (HOCs)
- Component composition functions
- Compound components pattern
- Slot pattern for layouts
- Pure component builders

**Included Patterns**:
- `withLoading` - Add loading state to components
- `withErrorBoundary` - Add error handling
- `withAnalytics` - Add analytics tracking
- `compose` - Compose multiple HOCs
- `Card` - Compound component with subcomponents
- `Layout` - Flexible slot-based layout
- `ConditionalWrapper` - Conditional composition
- `ProviderComposer` - Compose multiple providers

**Use When**:
- Building complex UIs from simple parts
- Sharing cross-cutting concerns
- Creating flexible, configurable components
- Avoiding deep component hierarchies

**Example Pattern**:
```typescript
// HOC composition
const EnhancedComponent = compose(
  withLoading,
  withErrorBoundary,
  withAnalytics
)(BaseComponent);

// Compound components
<Card variant="elevated">
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// Slot pattern
<Layout
  header={<Header />}
  sidebar={<Sidebar />}
  content={<Content />}
  footer={<Footer />}
/>
```

## Usage Guidelines

### Step 1: Identify Component Type

**Simple Stateful Component** → Use `FunctionalComponent.template.tsx`
- Has local state
- Needs side effects
- Can benefit from reducer pattern

**Logic Sharing Component** → Use `RenderProps.template.tsx`
- Need to share logic across components
- Building data/state providers
- Want flexible rendering

**Complex Composition** → Use `ComponentComposition.template.tsx`
- Building from multiple parts
- Need cross-cutting concerns (loading, errors, analytics)
- Creating compound/compound components

### Step 2: Copy Template

```bash
cp FunctionalComponent.template.tsx ../ui/MyComponent.tsx
```

### Step 3: Customize

1. Replace type definitions with your component's types
2. Implement your business logic as pure functions
3. Design your reducer for state transitions
4. Create pure render functions
5. Compose in main component

### Step 4: Test

1. Write tests for pure functions (easy - no mocking)
2. Write tests for reducer (pure state transitions)
3. Write component integration tests

## Refactoring Checklist

When refactoring an existing component:

### Phase 1: Analysis
- [ ] Identify all state variables
- [ ] Identify all side effects
- [ ] Identify business logic
- [ ] Map current props
- [ ] List event handlers

### Phase 2: Pure Functions
- [ ] Extract utility functions
- [ ] Make all utility functions pure
- [ ] Test utility functions
- [ ] Extract render logic to pure functions

### Phase 3: Reducer
- [ ] Design state shape
- [ ] Define action types (discriminated union)
- [ ] Implement reducer (pure)
- [ ] Test reducer exhaustively
- [ ] Replace useState with useReducer

### Phase 4: Composition
- [ ] Break component into logical pieces
- [ ] Create sub-components
- [ ] Use render props where appropriate
- [ ] Apply HOCs for cross-cutting concerns

### Phase 5: Cleanup
- [ ] Remove imperative code
- [ ] Add memoization where needed
- [ ] Verify no unnecessary re-renders
- [ ] Document with JSDoc
- [ ] Write integration tests

## Testing Strategy

### Pure Functions (Easiest)
```typescript
describe('calculateTotal', () => {
  it('calculates correctly', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
});
```

### Reducers (Simple)
```typescript
describe('reducer', () => {
  it('updates state correctly', () => {
    const state = { count: 0 };
    const newState = reducer(state, { type: 'INCREMENT' });

    expect(newState.count).toBe(1);
    expect(state.count).toBe(0); // Immutability check
  });
});
```

### Components (Standard)
```typescript
describe('Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Component {...props} />);
    expect(getByText('Title')).toBeInTheDocument();
  });
});
```

## Performance Tips

### Memoization Checklist
- [ ] Use `memo()` on components that receive stable props
- [ ] Use `useMemo()` for expensive calculations
- [ ] Use `useCallback()` for event handlers passed as props
- [ ] Extract pure functions outside component (don't recreate)
- [ ] Use proper dependency arrays

### Anti-Patterns to Avoid
- ❌ Creating objects/arrays in render (use useMemo)
- ❌ Inline functions passed to children (use useCallback)
- ❌ Large dependency arrays (split into multiple effects)
- ❌ Non-pure functions in useMemo (defeats purpose)
- ❌ Over-memoization (profile first)

## Best Practices

### 1. Pure Functions First
Always extract business logic to pure functions before creating components.

```typescript
// ✓ Good
const getTotal = (items) => items.reduce((sum, item) => sum + item.price, 0);

const Component = ({ items }) => {
  const total = useMemo(() => getTotal(items), [items]);
  return <div>Total: {total}</div>;
};

// ✗ Bad
const Component = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <div>Total: {total}</div>;
};
```

### 2. Reducers for Complex State
Use reducers when state has complex transitions or multiple related values.

```typescript
// ✓ Good - Related state managed together
const [state, dispatch] = useReducer(reducer, initialState);

// ✗ Bad - Multiple related useState calls
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

### 3. Composition Over Complexity
Break large components into smaller, focused pieces.

```typescript
// ✓ Good
const PropertyCard = ({ property }) => (
  <>
    <PropertyCardImage images={property.images} />
    <PropertyCardContent property={property} />
    <PropertyCardActions id={property.id} />
  </>
);

// ✗ Bad - 500 line monolithic component
const PropertyCard = ({ property }) => {
  // ... 500 lines of mixed concerns
};
```

### 4. Type Safety
Use TypeScript for all patterns - discriminated unions for actions.

```typescript
// ✓ Good - Discriminated union
type Action =
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_DATA'; data: Data }
  | { type: 'SET_ERROR'; error: Error };

// ✗ Bad - Loose types
type Action = {
  type: string;
  payload?: any;
};
```

## Migration Examples

See `WEEK2_IMPLEMENTATION_PLAN.md` for detailed migration plans for:
- PropertyCard (486 → 200 lines)
- DashboardSettings (717 → 300 lines)
- SearchBarCore (502 → 180 lines)

## Resources

- **Analysis Report**: `WEEK1_ANALYSIS_REPORT.md`
- **Implementation Plan**: `WEEK2_IMPLEMENTATION_PLAN.md`
- **React Docs**: https://react.dev/
- **FP Patterns**: https://github.com/fantasyland/fantasy-land

## Support

For questions or issues with these templates:
1. Review the analysis report for component-specific guidance
2. Check the implementation plan for detailed examples
3. Consult with Team C architecture lead

---

**Last Updated**: Week 1 Analysis Complete
**Status**: Ready for Week 2 Implementation
