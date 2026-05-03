/**
 * Tests for createReducer - Type-Safe Reducer Factory
 *
 * Team B - Dev 6 (Testing & Performance)
 */

import { describe, it, expect } from '@jest/globals';
import {
  createReducer,
  createAction,
  createActions,
  isActionType,
  combineReducers,
  type Action,
  type Reducer,
} from '../createReducer';

describe('createReducer', () => {
  interface CounterState {
    count: number;
    label: string;
  }

  type CounterAction =
    | { type: 'INCREMENT'; payload: number }
    | { type: 'DECREMENT'; payload: number }
    | { type: 'RESET' }
    | { type: 'SET_LABEL'; payload: string };

  const initialState: CounterState = {
    count: 0,
    label: 'Counter',
  };

  it('should create a reducer with initial state', () => {
    const reducer = createReducer<CounterState, CounterAction>(initialState, {});
    const state = reducer(undefined, { type: 'INCREMENT', payload: 1 });
    expect(state).toEqual(initialState);
  });

  it('should handle actions correctly', () => {
    const reducer = createReducer<CounterState, CounterAction>(initialState, {
      INCREMENT: (state, action) => ({ ...state, count: state.count + action.payload }),
      DECREMENT: (state, action) => ({ ...state, count: state.count - action.payload }),
    });

    let state = reducer(undefined, { type: 'INCREMENT', payload: 5 });
    expect(state.count).toBe(5);

    state = reducer(state, { type: 'INCREMENT', payload: 3 });
    expect(state.count).toBe(8);

    state = reducer(state, { type: 'DECREMENT', payload: 2 });
    expect(state.count).toBe(6);
  });

  it('should return current state for unknown actions', () => {
    const reducer = createReducer<CounterState, CounterAction>(initialState, {
      INCREMENT: (state, action) => ({ ...state, count: state.count + action.payload }),
    });

    const state = reducer(initialState, { type: 'UNKNOWN' } as any);
    expect(state).toBe(initialState);
  });

  it('should freeze state in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const reducer = createReducer<CounterState, CounterAction>(initialState, {
      INCREMENT: (state, action) => ({ ...state, count: state.count + action.payload }),
    });

    const state = reducer(undefined, { type: 'INCREMENT', payload: 1 });
    expect(Object.isFrozen(state)).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it('should not freeze state in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const reducer = createReducer<CounterState, CounterAction>(initialState, {
      INCREMENT: (state, action) => ({ ...state, count: state.count + action.payload }),
    });

    const state = reducer(undefined, { type: 'INCREMENT', payload: 1 });
    expect(Object.isFrozen(state)).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });
});

describe('createAction', () => {
  it('should create action creators with payload', () => {
    type IncrementAction = { type: 'INCREMENT'; payload: number };
    const increment = createAction<IncrementAction>('INCREMENT');

    const action = increment(5);
    expect(action).toEqual({ type: 'INCREMENT', payload: 5 });
  });

  it('should create action creators without payload', () => {
    type ResetAction = { type: 'RESET' };
    const reset = createAction<ResetAction>('RESET');

    const action = reset();
    expect(action).toEqual({ type: 'RESET' });
  });

  it('should freeze actions in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    type IncrementAction = { type: 'INCREMENT'; payload: number };
    const increment = createAction<IncrementAction>('INCREMENT');

    const action = increment(5);
    expect(Object.isFrozen(action)).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });
});

describe('createActions', () => {
  type Actions =
    | { type: 'INCREMENT'; payload: number }
    | { type: 'DECREMENT'; payload: number }
    | { type: 'RESET' };

  it('should create multiple action creators', () => {
    const actions = createActions<Actions>(['INCREMENT', 'DECREMENT', 'RESET']);

    expect(actions.INCREMENT).toBeDefined();
    expect(actions.DECREMENT).toBeDefined();
    expect(actions.RESET).toBeDefined();
  });

  it('should create working action creators', () => {
    const actions = createActions<Actions>(['INCREMENT', 'DECREMENT', 'RESET']);

    expect(actions.INCREMENT(5)).toEqual({ type: 'INCREMENT', payload: 5 });
    expect(actions.DECREMENT(3)).toEqual({ type: 'DECREMENT', payload: 3 });
    expect(actions.RESET()).toEqual({ type: 'RESET' });
  });
});

describe('isActionType', () => {
  type Actions =
    | { type: 'INCREMENT'; payload: number }
    | { type: 'DECREMENT'; payload: number }
    | { type: 'RESET' };

  it('should correctly identify action types', () => {
    const action: Actions = { type: 'INCREMENT', payload: 5 };

    expect(isActionType(action, 'INCREMENT')).toBe(true);
    expect(isActionType(action, 'DECREMENT')).toBe(false);
    expect(isActionType(action, 'RESET')).toBe(false);
  });

  it('should provide type narrowing', () => {
    const action: Actions = { type: 'INCREMENT', payload: 5 };

    if (isActionType(action, 'INCREMENT')) {
      expect(action.payload).toBe(5);
    }
  });
});

describe('combineReducers', () => {
  interface CounterState {
    count: number;
  }

  interface TodoState {
    items: string[];
  }

  type AppState = {
    counter: CounterState;
    todos: TodoState;
  };

  type CounterAction =
    | { type: 'INCREMENT' }
    | { type: 'DECREMENT' };

  type TodoAction =
    | { type: 'ADD_TODO'; payload: string }
    | { type: 'REMOVE_TODO'; payload: number };

  type AppAction = CounterAction | TodoAction;

  it('should combine multiple reducers', () => {
    const counterReducer = createReducer<CounterState, AppAction>(
      { count: 0 },
      {
        INCREMENT: (state) => ({ count: state.count + 1 }),
        DECREMENT: (state) => ({ count: state.count - 1 }),
      }
    );

    const todoReducer = createReducer<TodoState, AppAction>(
      { items: [] },
      {
        ADD_TODO: (state, action: any) => ({ items: [...state.items, action.payload] }),
        REMOVE_TODO: (state, action: any) => ({
          items: state.items.filter((_, i) => i !== action.payload),
        }),
      }
    );

    const rootReducer = combineReducers<AppState, AppAction>({
      counter: counterReducer,
      todos: todoReducer,
    });

    let state = rootReducer(undefined, { type: 'INCREMENT' });
    expect(state.counter.count).toBe(1);
    expect(state.todos.items).toEqual([]);

    state = rootReducer(state, { type: 'ADD_TODO', payload: 'Test' });
    expect(state.counter.count).toBe(1);
    expect(state.todos.items).toEqual(['Test']);
  });

  it('should only update changed slices', () => {
    const counterReducer = createReducer<CounterState, AppAction>(
      { count: 0 },
      {
        INCREMENT: (state) => ({ count: state.count + 1 }),
      }
    );

    const todoReducer = createReducer<TodoState, AppAction>(
      { items: [] },
      {
        ADD_TODO: (state, action: any) => ({ items: [...state.items, action.payload] }),
      }
    );

    const rootReducer = combineReducers<AppState, AppAction>({
      counter: counterReducer,
      todos: todoReducer,
    });

    const state1 = rootReducer(undefined, { type: 'INCREMENT' });
    const state2 = rootReducer(state1, { type: 'INCREMENT' });

    expect(state1.counter).not.toBe(state2.counter);
    expect(state1.todos).toBe(state2.todos);
  });

  it('should freeze combined state in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const counterReducer = createReducer<CounterState, AppAction>(
      { count: 0 },
      {
        INCREMENT: (state) => ({ count: state.count + 1 }),
      }
    );

    const todoReducer = createReducer<TodoState, AppAction>(
      { items: [] },
      {}
    );

    const rootReducer = combineReducers<AppState, AppAction>({
      counter: counterReducer,
      todos: todoReducer,
    });

    const state = rootReducer(undefined, { type: 'INCREMENT' });
    expect(Object.isFrozen(state)).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });
});
