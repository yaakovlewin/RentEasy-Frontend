# WEEK 1 QUICK REFERENCE GUIDE

**Team C - FP Refactoring Preparation**

---

## 📋 DELIVERABLES CHECKLIST

### ✅ Analysis & Planning
- [x] `WEEK1_ANALYSIS_REPORT.md` - 300+ lines comprehensive analysis
- [x] `WEEK2_IMPLEMENTATION_PLAN.md` - 600+ lines detailed plan
- [x] `WEEK1_SUMMARY.md` - Executive summary
- [x] `WEEK1_QUICK_REFERENCE.md` - This guide

### ✅ Templates & Patterns
- [x] `FunctionalComponent.template.tsx` - Core FP pattern (360+ lines)
- [x] `RenderProps.template.tsx` - 7 reusable patterns (600+ lines)
- [x] `ComponentComposition.template.tsx` - 10+ composition patterns (600+ lines)
- [x] `patterns/README.md` - Pattern documentation (250+ lines)

---

## 🎯 TARGET COMPONENTS

| Component | Current Lines | Target Lines | Reduction |
|-----------|--------------|--------------|-----------|
| PropertyCard | 486 | ~200 | 59% |
| DashboardSettings | 717 | ~300 | 58% |
| SearchBarCore | 502 | ~180 | 64% |
| **TOTAL** | **1,705** | **~680** | **60%** |

---

## 📊 KEY METRICS

### Code Quality
- **Test Coverage**: 65% → 90%+ (+38%)
- **Cyclomatic Complexity**: 15 → 5 (-67%)
- **Pure Functions**: <10% → >80%
- **Reusable Components**: 3 → ~15

### Development Experience
- **Testing Difficulty**: Hard → Easy (pure functions)
- **Debugging**: Complex → Simple (predictable state)
- **Reusability**: Low → High (composition)
- **Maintainability**: Medium → High (separation of concerns)

---

## 🔧 PATTERNS QUICK REFERENCE

### When to Use Each Template

#### FunctionalComponent.template.tsx
**Use for**: Components with complex state and side effects
- Has local state management
- Needs side effects (API calls, intervals)
- Benefits from reducer pattern
- Example: PropertyCard, DashboardSettings

**Key Pattern**:
```typescript
const Component = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Side effects only in useEffect
  return renderPureFunction({ ...props, ...state });
};
```

#### RenderProps.template.tsx
**Use for**: Sharing logic between components
- Data fetching with loading/error states
- Form state management
- List operations (CRUD)
- Settings management
- Example: FormStateProvider, ListManager

**Key Pattern**:
```typescript
<Provider>
  {({ data, actions }) => (
    <YourComponent data={data} actions={actions} />
  )}
</Provider>
```

#### ComponentComposition.template.tsx
**Use for**: Building complex UIs from simple parts
- Cross-cutting concerns (loading, errors, analytics)
- Compound components
- Flexible layouts
- HOC composition
- Example: Card with subcomponents, Layout with slots

**Key Pattern**:
```typescript
const Enhanced = compose(
  withLoading,
  withErrorBoundary
)(Component);

<Card variant="elevated">
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

---

## 🚀 WEEK 2 SCHEDULE

### Day 1: PropertyCard Phase 1
- **Morning**: Extract pure functions & design reducer (4h)
- **Afternoon**: Extract render functions (4h)
- **Deliverable**: Pure utilities + reducer + render functions

### Day 2: PropertyCard Phase 2
- **Morning**: Component assembly (4h)
- **Afternoon**: Testing & documentation (4h)
- **Deliverable**: Complete refactored PropertyCard

### Day 3: DashboardSettings Phase 1
- **Morning**: Unified reducer design (4h)
- **Afternoon**: Settings configuration extraction (4h)
- **Deliverable**: Unified state + configuration

### Day 4: DashboardSettings Phase 2
- **Morning**: Complete all sections (4h)
- **Afternoon**: Testing & documentation (4h)
- **Deliverable**: Complete refactored DashboardSettings

### Day 5: SearchBarCore
- **Morning**: Layout configuration (4h)
- **Afternoon**: Assembly & testing (4h)
- **Deliverable**: Complete refactored SearchBarCore

---

## 🎓 FP PRINCIPLES APPLIED

### 1. Pure Functions
```typescript
// ✓ Pure - same input = same output, no side effects
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.price, 0);

// ✗ Impure - depends on external state
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.price + tax, 0);
```

### 2. Immutability
```typescript
// ✓ Immutable - creates new object
const updateItem = (items: Item[], id: string, updates: Partial<Item>): Item[] =>
  items.map(item => item.id === id ? { ...item, ...updates } : item);

// ✗ Mutable - modifies original
const updateItem = (items: Item[], id: string, updates: Partial<Item>): void =>
  items.find(item => item.id === id).name = updates.name;
```

### 3. Composition
```typescript
// ✓ Composition - build complex from simple
const enhance = compose(
  withLoading,
  withErrorBoundary,
  memo
);

// ✗ Inheritance - tight coupling
class EnhancedComponent extends BaseComponent { ... }
```

### 4. Currying
```typescript
// ✓ Curried - partial application
const createHandler = (dispatch) => (id) => (event) => {
  dispatch({ type: 'SELECT', id });
};

// ✗ Not curried - all at once
const createHandler = (dispatch, id, event) => {
  dispatch({ type: 'SELECT', id });
};
```

---

## 🧪 TESTING STRATEGY

### Pure Functions (Easiest)
```typescript
// No mocking needed!
test('calculates total', () => {
  expect(calculateTotal([{ price: 10 }, { price: 20 }])).toBe(30);
});
```

### Reducers (Simple)
```typescript
// Pure state transitions
test('increments counter', () => {
  const state = { count: 0 };
  const newState = reducer(state, { type: 'INCREMENT' });

  expect(newState.count).toBe(1);
  expect(state.count).toBe(0); // Immutability check
});
```

### Components (Standard)
```typescript
// Standard React Testing Library
test('renders correctly', () => {
  const { getByText } = render(<Component {...props} />);
  expect(getByText('Title')).toBeInTheDocument();
});
```

---

## 🚦 SUCCESS CRITERIA

### Per Component
- [ ] 50-65% code reduction achieved
- [ ] All state through reducer (zero useState)
- [ ] All rendering through pure functions
- [ ] 90%+ test coverage
- [ ] All tests passing
- [ ] Zero breaking changes

### Overall Week 2
- [ ] All 3 components refactored
- [ ] 60% average code reduction
- [ ] 90%+ test coverage across all
- [ ] Performance maintained or improved
- [ ] Documentation complete
- [ ] Code review approved

---

## 📝 REFACTORING CHECKLIST

### Before Starting
- [ ] Read analysis report for component
- [ ] Review implementation plan for component
- [ ] Choose appropriate template
- [ ] Set up test file

### During Refactoring
- [ ] Extract pure functions first
- [ ] Design and implement reducer
- [ ] Create pure render functions
- [ ] Replace useState with useReducer
- [ ] Add memoization
- [ ] Write tests for each piece
- [ ] Verify no breaking changes

### After Completion
- [ ] All tests passing
- [ ] 90%+ coverage
- [ ] JSDoc documentation added
- [ ] Code review requested
- [ ] Performance benchmarked
- [ ] Migration notes documented

---

## 🔍 COMMON ISSUES & SOLUTIONS

### Issue: Too many useState calls
**Solution**: Use unified reducer
```typescript
// Before: 8 separate useState
const [a, setA] = useState();
const [b, setB] = useState();
// ... 6 more

// After: Single reducer
const [state, dispatch] = useReducer(reducer, initialState);
```

### Issue: Business logic in render
**Solution**: Extract to pure functions
```typescript
// Before: Logic in component
const total = items.reduce((sum, item) => sum + item.price, 0);

// After: Pure function
const calculateTotal = (items) => items.reduce(...);
const total = useMemo(() => calculateTotal(items), [items]);
```

### Issue: Duplicated rendering code
**Solution**: Pure render functions
```typescript
// Before: Duplicated JSX
if (layout === 'hero') return <div>...</div>;
if (layout === 'header') return <div>...</div>;

// After: Data-driven
const config = getLayoutConfig(layout);
return renderLayout(config, data);
```

### Issue: Complex event handlers
**Solution**: Curried event creators
```typescript
// Before: Inline handlers
onClick={(e) => { e.preventDefault(); doSomething(); }}

// After: Curried creator
const handleClick = createClickHandler(dispatch);
onClick={handleClick(id)}
```

---

## 📚 DOCUMENTATION LOCATIONS

### Analysis & Planning
- **Comprehensive Analysis**: `WEEK1_ANALYSIS_REPORT.md`
- **Implementation Plan**: `WEEK2_IMPLEMENTATION_PLAN.md`
- **Executive Summary**: `WEEK1_SUMMARY.md`
- **Quick Reference**: `WEEK1_QUICK_REFERENCE.md` (this file)

### Templates & Patterns
- **Core FP Pattern**: `src/components/patterns/FunctionalComponent.template.tsx`
- **Render Props**: `src/components/patterns/RenderProps.template.tsx`
- **Composition**: `src/components/patterns/ComponentComposition.template.tsx`
- **Pattern Guide**: `src/components/patterns/README.md`

### Target Components
- **PropertyCard**: `src/components/ui/property-card.tsx`
- **DashboardSettings**: `src/components/dashboard/components/DashboardSettings.tsx`
- **SearchBarCore**: `src/components/search/SearchBarCore.tsx`

---

## 🎯 TEAM ROLES

| Developer | Role | Focus Area |
|-----------|------|------------|
| Senior Dev 1 | Architecture Lead | Reducers, state management |
| Senior Dev 2 | Pure Functions | Business logic, utilities |
| Senior Dev 3 | Render Props | Component patterns |
| Senior Dev 4 | Performance | Optimization, memoization |
| Senior Dev 5 | Composition | Component splitting |
| Senior Dev 6 | Testing & QA | Test coverage, quality |

---

## 📞 SUPPORT

### Questions About
- **Analysis**: See `WEEK1_ANALYSIS_REPORT.md`
- **Implementation**: See `WEEK2_IMPLEMENTATION_PLAN.md`
- **Patterns**: See `src/components/patterns/README.md`
- **Templates**: See individual template files

### Blockers
- Escalate immediately to Senior Dev 1 (Architecture Lead)
- Daily checkpoints at 12:00 PM and 5:00 PM
- Team available for pair programming

---

## ✅ READINESS CHECK

Before starting Week 2, verify:
- [x] All Week 1 deliverables reviewed
- [x] Templates understood by all team members
- [x] Implementation plan reviewed
- [x] Development environment ready
- [x] Test infrastructure ready
- [x] Team roles clear

**Status**: ✅ READY FOR WEEK 2

---

**Last Updated**: End of Week 1
**Next Milestone**: Week 2 Day 1 @ 9:00 AM
