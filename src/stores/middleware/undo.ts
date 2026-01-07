import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// ============================================================================
// UNDO/REDO MIDDLEWARE
// ============================================================================

/**
 * Undo/Redo middleware for Zustand
 *
 * Tracks state history and provides undo/redo functionality.
 *
 * Features:
 * - Configurable history limit (default: 50 actions)
 * - Automatic timestamp tracking
 * - Action labeling for debugging
 * - Clear history functionality
 *
 * Usage:
 * ```ts
 * const useStore = create<Store>()(
 *   undo(
 *     (set, get) => ({
 *       // your store
 *     }),
 *     { limit: 50 }
 *   )
 * )
 * ```
 */

type Undo = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, [...Mps, ['undo', unknown]], Mcs>,
  options?: { limit?: number }
) => StateCreator<T, Mps, [['undo', unknown], ...Mcs]>;

type UndoState<T> = {
  past: { state: T; action: string; timestamp: number }[];
  future: { state: T; action: string; timestamp: number }[];
};

type WithUndo<T> = T & {
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
};

declare module 'zustand' {
  interface StoreMutators<S, A> {
    undo: Write<Cast<S, object>, WithUndo<Cast<S, object>>>;
  }
}

type Write<T, U> = Omit<T, keyof U> & U;
type Cast<T, U> = T extends U ? T : U;

const undoImpl: Undo = (initializer, options = {}) => (set, get, store) => {
  const limit = options.limit ?? 50;

  // Wrap the store with undo state
  type T = ReturnType<typeof initializer>;
  type UndoStore = T & UndoState<T> & WithUndo<T>;

  const undoState: UndoState<T> = {
    past: [],
    future: [],
  };

  // Override set to track history
  const wrappedSet: typeof set = (partial, replace, action) => {
    const currentState = get() as UndoStore;

    // Save current state to history before making change
    const stateToSave = { ...currentState };
    delete (stateToSave as any).past;
    delete (stateToSave as any).future;
    delete (stateToSave as any).undo;
    delete (stateToSave as any).redo;
    delete (stateToSave as any).clearHistory;
    delete (stateToSave as any).canUndo;
    delete (stateToSave as any).canRedo;
    delete (stateToSave as any).historySize;

    // Only save to history if action is not from undo/redo
    const actionName = typeof action === 'string' ? action : 'setState';
    if (actionName !== '__UNDO__' && actionName !== '__REDO__') {
      currentState.past.push({
        state: stateToSave as T,
        action: actionName,
        timestamp: Date.now(),
      });

      // Limit history size
      if (currentState.past.length > limit) {
        currentState.past.shift();
      }

      // Clear future when new action is performed
      currentState.future = [];
    }

    set(partial as any, replace, action);
  };

  // Initialize store with wrapped set
  const initialState = initializer(wrappedSet, get, store);

  // Add undo/redo methods
  return {
    ...initialState,
    ...undoState,

    undo: () => {
      const state = get() as UndoStore;
      if (state.past.length === 0) return;

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);

      // Save current state to future
      const currentState = { ...state };
      delete (currentState as any).past;
      delete (currentState as any).future;
      delete (currentState as any).undo;
      delete (currentState as any).redo;
      delete (currentState as any).clearHistory;
      delete (currentState as any).canUndo;
      delete (currentState as any).canRedo;
      delete (currentState as any).historySize;

      const newFuture = [
        ...state.future,
        {
          state: currentState as T,
          action: 'undo',
          timestamp: Date.now(),
        },
      ];

      set(
        {
          ...previous.state,
          past: newPast,
          future: newFuture,
        } as any,
        true,
        '__UNDO__'
      );
    },

    redo: () => {
      const state = get() as UndoStore;
      if (state.future.length === 0) return;

      const next = state.future[state.future.length - 1];
      const newFuture = state.future.slice(0, -1);

      // Save current state to past
      const currentState = { ...state };
      delete (currentState as any).past;
      delete (currentState as any).future;
      delete (currentState as any).undo;
      delete (currentState as any).redo;
      delete (currentState as any).clearHistory;
      delete (currentState as any).canUndo;
      delete (currentState as any).canRedo;
      delete (currentState as any).historySize;

      const newPast = [
        ...state.past,
        {
          state: currentState as T,
          action: 'redo',
          timestamp: Date.now(),
        },
      ];

      set(
        {
          ...next.state,
          past: newPast,
          future: newFuture,
        } as any,
        true,
        '__REDO__'
      );
    },

    clearHistory: () => {
      set(
        {
          past: [],
          future: [],
        } as any,
        false,
        'clearHistory'
      );
    },

    get canUndo() {
      return (get() as UndoStore).past.length > 0;
    },

    get canRedo() {
      return (get() as UndoStore).future.length > 0;
    },

    get historySize() {
      const state = get() as UndoStore;
      return state.past.length + state.future.length;
    },
  } as UndoStore;
};

export const undo = undoImpl as Undo;
