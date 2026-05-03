/**
 * FUNCTIONAL COMPONENT TEMPLATE
 *
 * This template demonstrates the core FP pattern for React components:
 * - Pure render functions separated from side effects
 * - State management through reducers
 * - Immutable state transitions
 * - Curried event handlers
 * - Composition over inheritance
 *
 * Use this template as a starting point for refactoring imperative components
 * into functional components following FP principles.
 */

import React, { useReducer, useMemo, useCallback, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Component props - external API
 */
interface FunctionalComponentProps {
  // Data props
  data: DataType;
  config?: ConfigType;

  // Callback props
  onAction?: (payload: ActionPayload) => void;
  onUpdate?: (data: DataType) => void;

  // Style props
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';

  // Test props
  'data-testid'?: string;
}

/**
 * Component state - internal state management
 */
type ComponentState = {
  // UI state
  ui: {
    isHovered: boolean;
    isActive: boolean;
    selectedIndex: number;
  };

  // Data state
  data: {
    items: Item[];
    filteredItems: Item[];
  };

  // Meta state
  meta: {
    isLoading: boolean;
    hasChanges: boolean;
    lastUpdated: Date | null;
  };
};

/**
 * State actions - discriminated union for type safety
 */
type ComponentAction =
  | { type: 'SET_HOVER'; isHovered: boolean }
  | { type: 'SET_ACTIVE'; isActive: boolean }
  | { type: 'SELECT_ITEM'; index: number }
  | { type: 'UPDATE_ITEMS'; items: Item[] }
  | { type: 'FILTER_ITEMS'; predicate: (item: Item) => boolean }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'MARK_UPDATED' }
  | { type: 'RESET' };

// Supporting types
type DataType = {
  id: string;
  title: string;
  items: Item[];
};

type Item = {
  id: string;
  name: string;
  value: number;
};

type ConfigType = {
  maxItems: number;
  showHeader: boolean;
  enableFiltering: boolean;
};

type ActionPayload = {
  action: string;
  data: unknown;
};

// =============================================================================
// PURE FUNCTIONS - Business Logic
// =============================================================================

/**
 * Pure function: Filter items based on predicate
 */
const filterItems = (items: Item[], predicate: (item: Item) => boolean): Item[] =>
  items.filter(predicate);

/**
 * Pure function: Sort items by value
 */
const sortItemsByValue = (items: Item[]): Item[] =>
  [...items].sort((a, b) => b.value - a.value);

/**
 * Pure function: Calculate total value
 */
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.value, 0);

/**
 * Pure function: Get selected item
 */
const getSelectedItem = (items: Item[], index: number): Item | null =>
  items[index] ?? null;

/**
 * Pure function: Validate item
 */
const isValidItem = (item: Item): boolean =>
  item.id !== '' && item.name !== '' && item.value >= 0;

// =============================================================================
// REDUCER - Pure State Transitions
// =============================================================================

/**
 * Initial state factory
 */
const createInitialState = (data: DataType): ComponentState => ({
  ui: {
    isHovered: false,
    isActive: false,
    selectedIndex: -1,
  },
  data: {
    items: data.items,
    filteredItems: data.items,
  },
  meta: {
    isLoading: false,
    hasChanges: false,
    lastUpdated: null,
  },
});

/**
 * Pure reducer function - all state transitions go through here
 *
 * Key principles:
 * - Always return new state object (immutability)
 * - No side effects
 * - Deterministic (same input = same output)
 */
const componentReducer = (
  state: ComponentState,
  action: ComponentAction
): ComponentState => {
  switch (action.type) {
    case 'SET_HOVER':
      return {
        ...state,
        ui: { ...state.ui, isHovered: action.isHovered },
      };

    case 'SET_ACTIVE':
      return {
        ...state,
        ui: { ...state.ui, isActive: action.isActive },
      };

    case 'SELECT_ITEM':
      return {
        ...state,
        ui: { ...state.ui, selectedIndex: action.index },
      };

    case 'UPDATE_ITEMS':
      return {
        ...state,
        data: {
          items: action.items,
          filteredItems: action.items,
        },
        meta: {
          ...state.meta,
          hasChanges: true,
          lastUpdated: new Date(),
        },
      };

    case 'FILTER_ITEMS':
      return {
        ...state,
        data: {
          ...state.data,
          filteredItems: filterItems(state.data.items, action.predicate),
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        meta: { ...state.meta, isLoading: action.isLoading },
      };

    case 'MARK_UPDATED':
      return {
        ...state,
        meta: {
          ...state.meta,
          hasChanges: false,
          lastUpdated: new Date(),
        },
      };

    case 'RESET':
      return createInitialState({ id: '', title: '', items: state.data.items });

    default:
      return state;
  }
};

// =============================================================================
// EVENT CREATORS - Curried Pure Functions
// =============================================================================

/**
 * Curried event creator pattern
 * Benefits:
 * - Pre-bind dispatch
 * - Partially apply data
 * - Create reusable handlers
 */
type EventCreator<P> = (
  dispatch: React.Dispatch<ComponentAction>
) => (payload: P) => (event: React.MouseEvent) => void;

/**
 * Create click handler with dispatch bound
 */
const createItemClickHandler: EventCreator<number> =
  (dispatch) => (index) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: 'SELECT_ITEM', index });
  };

/**
 * Create hover handler
 */
const createHoverHandler = (
  dispatch: React.Dispatch<ComponentAction>
) => (isHovered: boolean) => () => {
  dispatch({ type: 'SET_HOVER', isHovered });
};

/**
 * Create filter handler
 */
const createFilterHandler = (
  dispatch: React.Dispatch<ComponentAction>
) => (predicate: (item: Item) => boolean) => () => {
  dispatch({ type: 'FILTER_ITEMS', predicate });
};

// =============================================================================
// CONFIGURATION - Pure Data Structures
// =============================================================================

/**
 * Variant configuration as pure data
 */
type VariantConfig = {
  containerClass: string;
  itemClass: string;
  headerClass: string;
};

const variantConfigs: Record<string, VariantConfig> = {
  default: {
    containerClass: 'p-4 rounded-lg',
    itemClass: 'px-3 py-2',
    headerClass: 'text-lg font-semibold',
  },
  compact: {
    containerClass: 'p-2 rounded',
    itemClass: 'px-2 py-1 text-sm',
    headerClass: 'text-base font-medium',
  },
  expanded: {
    containerClass: 'p-6 rounded-xl',
    itemClass: 'px-4 py-3',
    headerClass: 'text-xl font-bold',
  },
};

/**
 * Pure function: Get variant configuration
 */
const getVariantConfig = (variant: string): VariantConfig =>
  variantConfigs[variant] ?? variantConfigs.default;

// =============================================================================
// PURE RENDER FUNCTIONS - Presentational Logic
// =============================================================================

/**
 * Pure render function: Header
 */
type HeaderProps = {
  title: string;
  config: VariantConfig;
  className?: string;
};

const renderHeader = ({ title, config, className }: HeaderProps): JSX.Element => (
  <div className={cn(config.headerClass, className)}>
    {title}
  </div>
);

/**
 * Pure render function: Item
 */
type ItemRenderProps = {
  item: Item;
  index: number;
  isSelected: boolean;
  config: VariantConfig;
  onClick: (event: React.MouseEvent) => void;
};

const renderItem = ({
  item,
  index,
  isSelected,
  config,
  onClick,
}: ItemRenderProps): JSX.Element => (
  <div
    key={item.id}
    className={cn(
      config.itemClass,
      'cursor-pointer transition-colors',
      isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'
    )}
    onClick={onClick}
  >
    <div className="font-medium">{item.name}</div>
    <div className="text-sm opacity-75">{item.value}</div>
  </div>
);

/**
 * Pure render function: Item list
 */
type ItemListRenderProps = {
  items: Item[];
  selectedIndex: number;
  config: VariantConfig;
  onItemClick: (index: number) => (event: React.MouseEvent) => void;
};

const renderItemList = ({
  items,
  selectedIndex,
  config,
  onItemClick,
}: ItemListRenderProps): JSX.Element => (
  <div className="space-y-2">
    {items.map((item, index) =>
      renderItem({
        item,
        index,
        isSelected: index === selectedIndex,
        config,
        onClick: onItemClick(index),
      })
    )}
  </div>
);

/**
 * Pure render function: Footer with stats
 */
type FooterProps = {
  totalItems: number;
  totalValue: number;
  config: VariantConfig;
};

const renderFooter = ({ totalItems, totalValue, config }: FooterProps): JSX.Element => (
  <div className={cn('mt-4 pt-4 border-t', config.itemClass)}>
    <div className="flex justify-between">
      <span>Total Items: {totalItems}</span>
      <span>Total Value: ${totalValue}</span>
    </div>
  </div>
);

// =============================================================================
// MAIN COMPONENT - Container with Side Effects
// =============================================================================

/**
 * Main component following FP principles:
 *
 * 1. State managed through reducer (pure state transitions)
 * 2. Side effects isolated in useEffect
 * 3. Event handlers created with curried functions
 * 4. Rendering delegated to pure functions
 * 5. Memoized derived data
 *
 * The component is primarily a coordinator between:
 * - External props
 * - Internal state (reducer)
 * - Side effects (useEffect)
 * - Pure render functions
 */
const FunctionalComponentBase: React.FC<FunctionalComponentProps> = ({
  data,
  config,
  onAction,
  onUpdate,
  className,
  variant = 'default',
  'data-testid': testId,
}) => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Initialize state with reducer
  const [state, dispatch] = useReducer(
    componentReducer,
    data,
    createInitialState
  );

  // ==========================================================================
  // DERIVED DATA - Memoized
  // ==========================================================================

  // Get variant configuration
  const variantConfig = useMemo(() => getVariantConfig(variant), [variant]);

  // Calculate total value
  const totalValue = useMemo(
    () => calculateTotal(state.data.filteredItems),
    [state.data.filteredItems]
  );

  // Get selected item
  const selectedItem = useMemo(
    () => getSelectedItem(state.data.items, state.ui.selectedIndex),
    [state.data.items, state.ui.selectedIndex]
  );

  // ==========================================================================
  // EVENT HANDLERS - Curried
  // ==========================================================================

  // Create item click handler with dispatch bound
  const handleItemClick = useMemo(
    () => createItemClickHandler(dispatch),
    [dispatch]
  );

  // Create hover handlers
  const handleMouseEnter = useMemo(
    () => createHoverHandler(dispatch)(true),
    [dispatch]
  );

  const handleMouseLeave = useMemo(
    () => createHoverHandler(dispatch)(false),
    [dispatch]
  );

  // Create callback for external action
  const handleAction = useCallback(
    (actionType: string) => () => {
      onAction?.({ action: actionType, data: selectedItem });
    },
    [onAction, selectedItem]
  );

  // ==========================================================================
  // SIDE EFFECTS - Isolated
  // ==========================================================================

  // Sync external data changes
  useEffect(() => {
    dispatch({ type: 'UPDATE_ITEMS', items: data.items });
  }, [data.items]);

  // Notify parent of changes
  useEffect(() => {
    if (state.meta.hasChanges && onUpdate) {
      onUpdate({
        ...data,
        items: state.data.items,
      });
      dispatch({ type: 'MARK_UPDATED' });
    }
  }, [state.meta.hasChanges, state.data.items, data, onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup logic here
    };
  }, []);

  // ==========================================================================
  // RENDER - Pure Function Delegation
  // ==========================================================================

  return (
    <div
      className={cn(variantConfig.containerClass, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={testId}
    >
      {/* Header */}
      {config?.showHeader !== false &&
        renderHeader({
          title: data.title,
          config: variantConfig,
        })}

      {/* Item List */}
      {renderItemList({
        items: state.data.filteredItems,
        selectedIndex: state.ui.selectedIndex,
        config: variantConfig,
        onItemClick: handleItemClick,
      })}

      {/* Footer */}
      {renderFooter({
        totalItems: state.data.filteredItems.length,
        totalValue,
        config: variantConfig,
      })}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAction('process')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Process
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// MEMOIZED EXPORT
// =============================================================================

/**
 * Export memoized version to prevent unnecessary re-renders
 * Component will only re-render when props actually change
 */
export const FunctionalComponent = memo(FunctionalComponentBase);
FunctionalComponent.displayName = 'FunctionalComponent';

// =============================================================================
// USAGE EXAMPLE
// =============================================================================

/*
// Simple usage
<FunctionalComponent
  data={{
    id: '1',
    title: 'My Items',
    items: [
      { id: '1', name: 'Item 1', value: 100 },
      { id: '2', name: 'Item 2', value: 200 },
    ],
  }}
  variant="default"
  onAction={(payload) => console.log('Action:', payload)}
/>

// With configuration
<FunctionalComponent
  data={myData}
  config={{
    maxItems: 10,
    showHeader: true,
    enableFiltering: true,
  }}
  variant="compact"
  onUpdate={(data) => saveData(data)}
  className="custom-class"
/>
*/

// =============================================================================
// TESTING EXAMPLE
// =============================================================================

/*
// Test pure functions
describe('Pure Functions', () => {
  it('calculates total correctly', () => {
    const items = [
      { id: '1', name: 'Item 1', value: 100 },
      { id: '2', name: 'Item 2', value: 200 },
    ];
    expect(calculateTotal(items)).toBe(300);
  });

  it('filters items correctly', () => {
    const items = [
      { id: '1', name: 'Item 1', value: 100 },
      { id: '2', name: 'Item 2', value: 200 },
    ];
    const filtered = filterItems(items, (item) => item.value > 150);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });
});

// Test reducer
describe('Reducer', () => {
  it('selects item', () => {
    const initialState = createInitialState({
      id: '1',
      title: 'Test',
      items: [],
    });

    const newState = componentReducer(initialState, {
      type: 'SELECT_ITEM',
      index: 2,
    });

    expect(newState.ui.selectedIndex).toBe(2);
    expect(initialState.ui.selectedIndex).toBe(-1); // Immutability check
  });
});

// Test component
describe('FunctionalComponent', () => {
  it('renders items', () => {
    const data = {
      id: '1',
      title: 'Test',
      items: [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 },
      ],
    };

    const { getByText } = render(<FunctionalComponent data={data} />);

    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
    expect(getByText('Total Value: $300')).toBeInTheDocument();
  });
});
*/

export default FunctionalComponent;
