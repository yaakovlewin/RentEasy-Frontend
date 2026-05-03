/**
 * Functional State Management - Type-Safe Reducer Factory
 *
 * This module provides a type-safe factory for creating reducers with action handlers.
 * It follows functional programming principles with immutability and type safety.
 *
 * Team B - Dev 1 (State Architecture Lead), Dev 4 (Type Systems Specialist)
 */

/**
 * Base action type with discriminated union support
 */
export interface Action {
  readonly type: string;
}

/**
 * Action handler function type
 */
export type ActionHandler<S, A extends Action> = (state: S, action: A) => S;

/**
 * Map of action types to their handlers
 */
export type ActionHandlers<S, A extends Action> = {
  [K in A['type']]?: ActionHandler<S, Extract<A, { type: K }>>;
};

/**
 * Reducer function type
 */
export type Reducer<S, A extends Action> = (state: S | undefined, action: A) => S;

/**
 * Creates a type-safe reducer from an initial state and action handlers
 *
 * @param initialState - The initial state of the reducer
 * @param handlers - Map of action types to handler functions
 * @returns A reducer function
 *
 * @example
 * ```typescript
 * type State = { readonly count: number };
 * type Actions =
 *   | { type: 'INCREMENT'; payload: number }
 *   | { type: 'DECREMENT'; payload: number };
 *
 * const reducer = createReducer<State, Actions>(
 *   { count: 0 },
 *   {
 *     INCREMENT: (state, action) => ({ count: state.count + action.payload }),
 *     DECREMENT: (state, action) => ({ count: state.count - action.payload }),
 *   }
 * );
 * ```
 */
export const createReducer = <S, A extends Action>(
  initialState: S,
  handlers: Partial<ActionHandlers<S, A>>
): Reducer<S, A> => {
  return (state = initialState, action): S => {
    const handler = handlers[action.type as A['type']];
    if (!handler) {
      return state;
    }

    const newState = handler(state, action as any);

    // Freeze the state in development to prevent mutations
    if (process.env.NODE_ENV === 'development') {
      return Object.freeze(newState) as S;
    }

    return newState;
  };
};

/**
 * Action creator factory type
 */
export type ActionCreator<A extends Action> = A extends { payload: infer P }
  ? (payload: P) => A
  : () => A;

/**
 * Creates a type-safe action creator function
 *
 * @param type - The action type
 * @returns An action creator function
 *
 * @example
 * ```typescript
 * const increment = createAction<{ type: 'INCREMENT'; payload: number }>('INCREMENT');
 * const action = increment(5); // { type: 'INCREMENT', payload: 5 }
 * ```
 */
export const createAction = <A extends Action>(
  type: A['type']
): ActionCreator<A> => {
  return ((payload?: any) => {
    if (payload !== undefined) {
      const action = { type, payload };
      return process.env.NODE_ENV === 'development'
        ? Object.freeze(action)
        : action;
    }
    const action = { type };
    return process.env.NODE_ENV === 'development'
      ? Object.freeze(action)
      : action;
  }) as ActionCreator<A>;
};

/**
 * Creates multiple action creators at once
 *
 * @param types - Array of action types
 * @returns Map of action creators
 *
 * @example
 * ```typescript
 * type Actions =
 *   | { type: 'INCREMENT'; payload: number }
 *   | { type: 'DECREMENT'; payload: number }
 *   | { type: 'RESET' };
 *
 * const actions = createActions<Actions>(['INCREMENT', 'DECREMENT', 'RESET']);
 * ```
 */
export const createActions = <A extends Action>(
  types: ReadonlyArray<A['type']>
): Record<A['type'], ActionCreator<A>> => {
  return types.reduce((acc, type) => {
    acc[type] = createAction<A>(type);
    return acc;
  }, {} as Record<A['type'], ActionCreator<A>>);
};

/**
 * Type guard to check if an action is of a specific type
 *
 * @param action - The action to check
 * @param type - The expected action type
 * @returns True if action matches the type
 *
 * @example
 * ```typescript
 * if (isActionType(action, 'INCREMENT')) {
 *   // action is now typed as INCREMENT action
 *   console.log(action.payload);
 * }
 * ```
 */
export const isActionType = <A extends Action, T extends A['type']>(
  action: A,
  type: T
): action is Extract<A, { type: T }> => {
  return action.type === type;
};

/**
 * Combines multiple reducers into a single reducer
 *
 * @param reducers - Map of key to reducer functions
 * @returns Combined reducer function
 *
 * @example
 * ```typescript
 * const rootReducer = combineReducers({
 *   counter: counterReducer,
 *   todos: todosReducer,
 * });
 * ```
 */
export const combineReducers = <S extends Record<string, any>, A extends Action>(
  reducers: { [K in keyof S]: Reducer<S[K], A> }
): Reducer<S, A> => {
  return (state = {} as S, action): S => {
    const nextState = {} as S;
    let hasChanged = false;

    for (const key in reducers) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    const finalState = hasChanged ? nextState : state;

    if (process.env.NODE_ENV === 'development') {
      return Object.freeze(finalState) as S;
    }

    return finalState;
  };
};
