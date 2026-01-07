# State Management Architecture

## Overview

This application uses **Zustand + Immer** for predictable, immutable state management with built-in undo/redo functionality.

### Why This Stack?

| Feature | Implementation | Rationale |
|---------|---------------|-----------|
| **State Store** | Zustand | Minimal boilerplate, no Provider hell, great TypeScript support |
| **Immutability** | Immer | Write "mutative" code, get immutable updates automatically |
| **Undo/Redo** | Custom middleware | Full history tracking with configurable limits |
| **Performance** | Selectors | Fine-grained subscriptions prevent unnecessary re-renders |

---

## Architecture

### File Structure

```
src/
├── types/
│   └── index.ts                    # Shared TypeScript types
├── stores/
│   ├── middleware/
│   │   └── undo.ts                 # Undo/redo middleware
│   └── useRouteStore.ts            # Main Zustand store
└── components/
    └── DragDropRoutePlanner.tsx    # UI components (consumers)
```

---

## Core Concepts

### 1. Single Source of Truth

All application state lives in one Zustand store:

```typescript
interface RouteStore {
  // Domain State
  days: Day[];
  drivers: Driver[];
  unassignedClients: Client[];

  // UI State
  selectedClientId: string | null;

  // Actions
  moveClient: (...) => void;
  moveRoute: (...) => void;

  // Undo/Redo (from middleware)
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

**Benefits:**
- Predictable data flow
- Easy to debug (inspect store in DevTools)
- No prop drilling

---

### 2. Immutable Updates with Immer

Instead of manually cloning state:

```typescript
// ❌ Before (manual deep clone)
const newDays = JSON.parse(JSON.stringify(prevDays));

// ✅ After (Immer)
set((state) => {
  state.days[0].routes[0].clients.push(newClient);
  // Immer creates immutable copy automatically
});
```

**How it works:**
- Immer wraps state in a Proxy
- Tracks "mutations"
- Produces new immutable state
- Zero cost for unchanged parts

**Performance:**
- Faster than `JSON.parse/stringify` (structural sharing)
- No manual object spreading
- Less code = fewer bugs

---

### 3. Undo/Redo Middleware

Custom middleware that wraps the store and tracks history:

```typescript
export const useRouteStore = create<RouteStore>()(
  undo(
    immer((set, get) => ({
      // your store
    })),
    { limit: 50 } // Keep last 50 actions
  )
);
```

**How it works:**

```
┌─────────────────────────────────────────────────────┐
│                   Undo Middleware                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Past: [state1, state2, state3, state4]             │
│  Current: state5                                     │
│  Future: []                                          │
│                                                       │
│  User calls undo()                                   │
│    → Move state5 to future                          │
│    → Restore state4 as current                      │
│                                                       │
│  User calls redo()                                   │
│    → Move current to past                           │
│    → Restore state5 from future                     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**History Entry Format:**

```typescript
{
  state: { days, drivers, unassignedClients },
  action: "moveClient:c1:r1→r2",
  timestamp: 1704628800000
}
```

**Action Labeling:**

Every state mutation is labeled for debugging:

```typescript
set(
  (state) => { /* mutations */ },
  false,
  'moveClient:c1:r1→r2'  // Action label
);
```

Appears in Redux DevTools for debugging.

---

### 4. Selectors for Performance

Instead of subscribing to entire store:

```typescript
// ❌ Bad: Re-renders on ANY state change
const store = useRouteStore();

// ✅ Good: Only re-renders when days change
const days = useRouteStore((state) => state.days);

// ✅ Better: Computed values with selectors
const boxCount = useRouteStore(selectDayBoxCount('mon'));
```

**Custom Selectors:**

```typescript
// stores/useRouteStore.ts
export const selectDayBoxCount = (dayId: string) => (state: RouteStore) => {
  const day = state.days.find((d) => d.id === dayId);
  return day?.routes.reduce((sum, route) => sum + route.boxes, 0) ?? 0;
};

// Component usage
const boxCount = useRouteStore(selectDayBoxCount('mon'));
```

**Benefits:**
- Fine-grained subscriptions
- Memoized computations
- Prevents unnecessary re-renders

---

## Actions

### Client Operations

#### Move Client Between Routes

```typescript
moveClient(clientId, fromRouteId, fromDayId, toRouteId, toDayId)
```

**What it does:**
1. Find client in source route
2. Remove from source route
3. Add to target route
4. Recalculate capacities for both routes
5. Save to history with label: `moveClient:c1:r1→r2`

**Immutability:** Immer handles deep cloning automatically.

#### Reorder Clients Within Route

```typescript
reorderClients(routeId, dayId, clientIds)
```

**What it does:**
1. Find route
2. Rebuild clients array in new order
3. Save to history

**Use case:** Change delivery stop sequence.

#### Assign Client from Unassigned Pool

```typescript
assignClientToRoute(clientId, routeId, dayId)
```

**What it does:**
1. Remove from `unassignedClients`
2. Add to target route
3. Recalculate capacity

#### Unassign Client Back to Pool

```typescript
unassignClient(clientId, routeId, dayId)
```

**What it does:**
1. Remove from route
2. Add back to `unassignedClients`

---

### Route Operations

#### Move Route Between Days

```typescript
moveRoute(routeId, fromDayId, toDayId)
```

**What it does:**
1. Find route in source day
2. Remove from source
3. Add to target day
4. Save to history with label: `moveRoute:r1:mon→tue`

#### Add New Route

```typescript
addRoute(dayId, route)
```

**What it does:**
1. Validate dayId exists
2. Append route to day
3. Save to history

#### Delete Route

```typescript
deleteRoute(dayId, routeId)
```

**What it does:**
1. Find route
2. Move all clients to `unassignedClients`
3. Remove route
4. Save to history

**Important:** Clients are preserved, not deleted.

#### Update Route Properties

```typescript
updateRoute(dayId, routeId, { driver: 'New Driver', status: 'confirmed' })
```

**What it does:**
1. Find route
2. Merge updates using `Object.assign`
3. Save to history

---

## Undo/Redo System

### How to Use

**In UI:**

```typescript
const undo = useRouteStore((state) => state.undo);
const redo = useRouteStore((state) => state.redo);
const canUndo = useRouteStore((state) => state.canUndo);
const canRedo = useRouteStore((state) => state.canRedo);

<button onClick={undo} disabled={!canUndo}>
  Undo
</button>
```

**Keyboard Shortcuts:**

```typescript
// Cmd/Ctrl + Z = Undo
// Cmd/Ctrl + Shift + Z = Redo
// Cmd/Ctrl + Y = Redo (alternative)

const handleKeyDown = (e: React.KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
};
```

---

### What Gets Tracked?

**Tracked (in history):**
- ✅ `moveClient`
- ✅ `moveRoute`
- ✅ `reorderClients`
- ✅ `addRoute`
- ✅ `deleteRoute`
- ✅ `updateRoute`
- ✅ `assignClientToRoute`
- ✅ `unassignClient`

**NOT Tracked (UI state only):**
- ❌ `setSelectedClient` (detail panel open/closed)
- ❌ Drag hover states
- ❌ Filter selections

**Rationale:** UI state changes shouldn't pollute undo history.

---

### Implementation Details

**History Limit:** 50 actions (configurable)

```typescript
undo(
  immer((set, get) => ({ /* store */ })),
  { limit: 50 }
)
```

**Why 50?**
- Balance between memory usage and usability
- 50 actions = ~10-15 minutes of work
- Typical session: 20-30 actions

**Memory Impact:**

```
Per history entry: ~5-10 KB (depends on data size)
50 entries × 10 KB = ~500 KB
```

Negligible for modern browsers.

---

### Edge Cases

**1. Undo on Empty History**
```typescript
undo(); // No-op if canUndo === false
```

**2. Redo After New Action**
```typescript
moveClient(...);  // Action 1
undo();           // Undo action 1
moveRoute(...);   // Action 2 - clears future (can't redo action 1)
```

**3. Undo/Redo Don't Add to History**
```typescript
// Special action labels prevent infinite loops
'__UNDO__'  // Ignored by history middleware
'__REDO__'  // Ignored by history middleware
```

---

## Manual Changes Always Respected

### Principle: User is Always Right

All actions are **explicit and manual**:

```typescript
// ✅ User drags client → calls moveClient()
// ✅ User clicks undo → calls undo()
// ✅ User edits route → calls updateRoute()

// ❌ NO automatic optimizations
// ❌ NO auto-save to backend
// ❌ NO background syncing
```

**No surprises:** What you see is what you get.

---

### Conflict Resolution: Last Write Wins

If implementing backend sync:

```typescript
// Optimistic update
moveClient(c1, r1, 'mon', r2, 'tue');

// API call
await api.moveClient(...);

// On conflict: backend wins
if (response.conflict) {
  undo(); // Revert optimistic update
  showError('Another user modified this route');
}
```

**Current implementation:** No backend = no conflicts.

---

## Performance Considerations

### Render Optimization

**Bad:**
```typescript
// Re-renders on ANY state change
function Component() {
  const store = useRouteStore();
  return <div>{store.days[0].routes.length}</div>;
}
```

**Good:**
```typescript
// Only re-renders when specific day changes
function Component() {
  const day = useRouteStore((state) => state.days[0]);
  return <div>{day.routes.length}</div>;
}
```

**Best:**
```typescript
// Only re-renders when computed value changes
const routeCount = useRouteStore((state) => state.days[0].routes.length);
```

---

### Memoization with Selectors

```typescript
// Selector with parameter
export const selectDayRoutes = (dayId: string) => (state: RouteStore) =>
  state.days.find((d) => d.id === dayId)?.routes ?? [];

// Usage
const routes = useRouteStore(selectDayRoutes('mon'));
```

**How it helps:**
- Zustand memoizes selector results
- Only recalculates if dependencies change
- Prevents unnecessary component re-renders

---

### Batch Updates

When multiple state changes happen together:

```typescript
// ❌ Bad: Triggers 3 re-renders
moveClient(...);
updateRoute(...);
setSelectedClient(...);

// ✅ Good: Single re-render
set((state) => {
  // Move client
  const sourceRoute = ...;
  const targetRoute = ...;

  // Update route
  route.status = 'confirmed';

  // Update UI state
  state.selectedClientId = null;
}, false, 'batchUpdate');
```

**When to batch:**
- Multiple related changes
- Atomic operations (all-or-nothing)

---

## Testing Strategy

### Unit Tests

```typescript
describe('useRouteStore', () => {
  it('moves client between routes', () => {
    const { result } = renderHook(() => useRouteStore());

    act(() => {
      result.current.moveClient('c1', 'r1', 'mon', 'r2', 'tue');
    });

    const sourceRoute = result.current.days
      .find(d => d.id === 'mon')
      ?.routes.find(r => r.id === 'r1');

    expect(sourceRoute?.clients).not.toContainEqual(
      expect.objectContaining({ id: 'c1' })
    );
  });

  it('supports undo/redo', () => {
    const { result } = renderHook(() => useRouteStore());

    const initialState = result.current.days;

    act(() => {
      result.current.moveClient('c1', 'r1', 'mon', 'r2', 'tue');
    });

    expect(result.current.days).not.toEqual(initialState);

    act(() => {
      result.current.undo();
    });

    expect(result.current.days).toEqual(initialState);
  });
});
```

---

### Integration Tests

```typescript
test('drag-and-drop updates store', async () => {
  render(<DragDropRoutePlanner />);

  const client = screen.getByText('Acme Corp');
  const targetRoute = screen.getByText('Route 2');

  await userEvent.drag(client, targetRoute);

  // Verify store updated
  const store = useRouteStore.getState();
  const route2 = store.days[0].routes.find(r => r.id === 'r2');
  expect(route2?.clients).toContainEqual(
    expect.objectContaining({ name: 'Acme Corp' })
  );
});
```

---

## Debugging

### Redux DevTools Integration

Zustand works with Redux DevTools automatically:

```typescript
// Install browser extension
// Chrome: Redux DevTools

// Open DevTools → Redux tab
// See all actions with labels:
// - moveClient:c1:r1→r2
// - moveRoute:r1:mon→tue
// - __UNDO__
// - __REDO__
```

**Features:**
- Time-travel debugging
- State diff inspection
- Action replay

---

### Console Logging

```typescript
// Add logging middleware for development
const log = (config) => (set, get, api) =>
  config(
    (args) => {
      console.log('  applying', args);
      set(args);
      console.log('  new state', get());
    },
    get,
    api
  );

const useRouteStore = create(log(undo(immer(...))));
```

---

### State Inspection

```typescript
// Get current state anytime
const state = useRouteStore.getState();
console.log('Days:', state.days);
console.log('Can undo?', state.canUndo);
console.log('History size:', state.historySize);

// Subscribe to changes
useRouteStore.subscribe((state) => {
  console.log('State changed:', state);
});
```

---

## Migration from useState

### Before (Component State)

```typescript
const [days, setDays] = useState<Day[]>(INITIAL_DAYS);

const moveClient = (clientId, fromRoute, toRoute) => {
  setDays((prevDays) => {
    const newDays = JSON.parse(JSON.stringify(prevDays));
    // Manual mutation logic...
    return newDays;
  });
};
```

**Problems:**
- ❌ No undo/redo
- ❌ Manual deep cloning (slow, error-prone)
- ❌ Logic scattered across components
- ❌ Hard to test

---

### After (Zustand + Immer)

```typescript
const days = useRouteStore((state) => state.days);
const moveClient = useRouteStore((state) => state.moveClient);
const undo = useRouteStore((state) => state.undo);

// Just call the action
moveClient(clientId, fromRoute, fromDay, toRoute, toDay);

// Undo anytime
undo();
```

**Benefits:**
- ✅ Built-in undo/redo
- ✅ Automatic immutability via Immer
- ✅ Centralized logic (easy to test)
- ✅ No prop drilling

---

## Best Practices

### 1. Keep Store Flat

**Bad:**
```typescript
{
  ui: {
    routing: {
      planning: {
        selectedClient: 'c1'
      }
    }
  }
}
```

**Good:**
```typescript
{
  selectedClientId: 'c1',
  days: [...],
  drivers: [...]
}
```

---

### 2. Use Selectors for Derived State

**Bad:**
```typescript
const boxCount = days
  .find(d => d.id === 'mon')
  ?.routes.reduce((sum, r) => sum + r.boxes, 0) ?? 0;
// Recalculates on every render
```

**Good:**
```typescript
const boxCount = useRouteStore(selectDayBoxCount('mon'));
// Memoized, only recalculates when day changes
```

---

### 3. Label All Actions

```typescript
set(
  (state) => { /* mutations */ },
  false,
  'descriptiveActionName'  // Always label!
);
```

**Why:**
- Debugging in Redux DevTools
- Undo history clarity
- Audit trail

---

### 4. Don't Store Derived Values

**Bad:**
```typescript
{
  routes: [...],
  totalBoxes: 500  // Derived from routes!
}
```

**Good:**
```typescript
{
  routes: [...]
}

// Compute on demand
const totalBoxes = routes.reduce((sum, r) => sum + r.boxes, 0);
```

---

## Future Enhancements

### 1. Persistence (LocalStorage)

```typescript
import { persist } from 'zustand/middleware';

const useRouteStore = create(
  persist(
    undo(immer(...)),
    {
      name: 'route-planning',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

**Auto-saves state to browser.**

---

### 2. Backend Sync

```typescript
const syncMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      set(args);
      api.sync(get()); // Send to server
    },
    get,
    api
  );
```

---

### 3. Optimistic Updates

```typescript
moveClient(...); // Update UI immediately

api.moveClient(...).catch(() => {
  undo(); // Revert on failure
  toast.error('Failed to move client');
});
```

---

## Summary

### Key Principles

1. **Single Source of Truth** - All state in Zustand store
2. **Immutability** - Immer handles it automatically
3. **Predictability** - Actions → State changes → UI updates
4. **Undo/Redo** - Built-in with custom middleware
5. **Manual Control** - User actions explicit, no surprises

### Architecture Benefits

| Feature | Benefit |
|---------|---------|
| **Zustand** | Minimal boilerplate, fast |
| **Immer** | Write simple code, get immutability |
| **Undo middleware** | Full history with zero effort |
| **Selectors** | Performance optimization |
| **TypeScript** | Type-safe actions and state |

### When to Use This Pattern

✅ **Good for:**
- Complex state with deep nesting
- Need undo/redo
- Multiple components sharing state
- Want to avoid Redux boilerplate

❌ **Overkill for:**
- Simple forms
- Purely local UI state (modals, tooltips)
- Temporary computed values

This state management system provides a solid foundation for the route planning application with room to grow as requirements evolve.
