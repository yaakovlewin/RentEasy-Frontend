/**
 * Functional State Management System
 *
 * This module provides a complete functional programming-based state management system
 * with type-safe reducers, immutable updates, and functional lenses.
 *
 * @module state
 */

// Reducer factory and action creators
export {
  createReducer,
  createAction,
  createActions,
  isActionType,
  combineReducers,
  type Action,
  type ActionHandler,
  type ActionHandlers,
  type Reducer,
  type ActionCreator,
} from './createReducer';

// Immutable state updaters
export {
  update,
  updateNested,
  updateDeep,
  updateArray,
  updateArrayWhere,
  appendToArray,
  prependToArray,
  removeFromArray,
  removeFromArrayWhere,
  insertIntoArray,
  toggleInArray,
  replaceInArray,
  mergeDeep,
  setPath,
  getPath,
  deepFreeze,
} from './stateUpdaters';

// Functional lenses
export {
  lens,
  prop,
  props,
  path,
  composeLens,
  compose,
  view,
  set,
  over,
  index,
  find,
  filter,
  traverse,
  withDefault,
  iso,
  type Lens,
} from './lenses';
