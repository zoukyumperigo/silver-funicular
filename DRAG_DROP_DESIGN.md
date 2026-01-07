# Drag-and-Drop Implementation - Design Decisions

## Technology Choice: @dnd-kit

**Why @dnd-kit over alternatives?**
- **Accessibility**: Built-in keyboard navigation and screen reader support
- **Performance**: Uses transform CSS (GPU-accelerated) instead of absolute positioning
- **Flexibility**: Works with virtualized lists, nested drag contexts
- **TypeScript**: Excellent type safety
- **Bundle size**: ~20KB gzipped (vs react-beautiful-dnd ~40KB)

---

## Architecture

### 3-Layer Component Structure

```
DragDropRoutePlanner (Context Provider)
├── DroppableDay (Day Column)
│   └── DroppableRoute (Route Card)
│       └── DraggableClient (Client Card)
```

**Why this structure?**
- **SortableContext per level**: Enables independent sorting at each hierarchy level
- **Data flow**: Active drag state flows down via props, mutations bubble up via state setters
- **Isolation**: Each droppable area manages its own drop zone visuals

---

## Key Implementation Details

### 1. Drag Handles (GripVertical icon)

```tsx
<div {...attributes} {...listeners}>
  <GripVertical />
</div>
```

**Why separate handles?**
- Prevents accidental drags when clicking to view details
- Standard UX pattern (users expect grip icon = draggable)
- Allows clicking on card content without triggering drag

---

### 2. Activation Constraint

```tsx
useSensor(PointerSensor, {
  activationConstraint: { distance: 8 }
})
```

**Why 8px threshold?**
- Prevents accidental drags from clicks
- Feels natural (iOS uses ~10px, Android ~8px)
- Balances responsiveness vs false positives

---

### 3. Visual Feedback States

| State | Visual Treatment | Purpose |
|-------|------------------|---------|
| **Dragging source** | 50% opacity + blue border | Shows item being moved |
| **Valid drop zone** | Green border + green bg tint | Confirms valid drop target |
| **Hovering day column** | Blue dashed border | Shows route can drop here |
| **Empty route/day** | Dashed border placeholder | Indicates droppable area |

**Why multiple visual cues?**
- Color (green = valid, blue = active)
- Border style (solid = active drag, dashed = empty zone)
- Opacity (source item fades, destination highlights)
- Redundant cues aid accessibility and work across color blindness types

---

### 4. Drag Overlay (Ghost)

```tsx
<DragOverlay>
  {activeItem && <GhostPreview />}
</DragOverlay>
```

**Why use DragOverlay?**
- Cursor follows item smoothly (not constrained by parent overflow)
- Item can cross stacking contexts (z-index boundaries)
- Original item stays in place (with opacity change) showing source location

---

### 5. Deep Cloning State

```tsx
const newDays = JSON.parse(JSON.stringify(prevDays));
```

**Why deep clone?**
- Ensures React detects state change (immutability)
- Prevents accidental mutation of nested objects
- Simple approach (for production: use immer or structuredClone)

**Trade-off**: Loses functions/dates/classes, but our data is POJOs only.

---

### 6. Collision Detection

```tsx
collisionDetection={closestCenter}
```

**Why closestCenter?**
- Works well for both grid (days) and list (clients in route) layouts
- More forgiving than closestCorners (easier to hit drop zones)
- Alternative considered: pointerWithin (too sensitive for nested drops)

---

## Drop Logic

### Client Movement
1. Extract client from source route
2. Add to target route's client array
3. Recalculate capacity (visual only, no business rules)

### Route Movement
1. Remove route from source day
2. Append to target day
3. Update all related client dayId references

**Why append instead of insert at position?**
- Simpler mental model for users
- Position-based insertion requires collision calculation
- Users can manually reorder after drop if needed

---

## Performance Considerations

### Optimizations Applied
- **Activation distance**: Reduces false drag starts
- **Transform CSS**: GPU-accelerated (not re-layout)
- **Minimal re-renders**: Only dragged item and drop zones update

### Not Implemented (Future)
- Virtualization (only needed if >100 routes visible)
- Memoization (premature - profile first)
- Debounced drop handlers (no API calls yet)

---

## Accessibility

### Built-in via @dnd-kit
- **Keyboard navigation**: Tab to item, Space to grab, Arrow keys to move, Space to drop
- **Screen readers**: Announces drag state, drop zones, actions
- **Focus management**: Returns focus to item after drop

### Custom additions
- Visible focus rings (browser default preserved)
- High contrast borders (2px, not 1px)
- Non-color indicators (icons + borders, not color alone)

---

## Known Limitations

### 1. No Undo/Redo
- **Reason**: Requires state history tracking (out of scope)
- **Mitigation**: Add in backend integration phase with undo stack

### 2. No Conflict Detection
- **Reason**: No business rules implemented (per requirements)
- **Mitigation**: Backend will validate on save

### 3. No Optimistic Capacity Calculation
- **Reason**: Mock data has static capacity percentages
- **Mitigation**: Real implementation recalculates based on sum(client.boxes)

### 4. No Multi-Select Drag
- **Reason**: Complex UX, rare use case for MVP
- **Mitigation**: Drag-and-drop multiple times (acceptable for <10 items)

---

## Testing Strategy (Not Implemented)

### Unit Tests
```typescript
test('dragging client updates correct route', () => {
  // Simulate drag event
  // Assert client moved from route A to route B
})
```

### Integration Tests (Playwright)
```typescript
test('drag client card to different route', async ({ page }) => {
  await page.dragAndDrop('[data-client-id="c1"]', '[data-route-id="r2"]')
  await expect('[data-route-id="r2"]').toContainText('Acme Corp')
})
```

---

## Future Enhancements

### Phase 2 Features
1. **Drag multiple items**: Shift+click to multi-select
2. **Drag to reorder**: Swap positions within same route
3. **Snap to position**: Insert between items (not just append)
4. **Drag from unassigned pool**: Add unassigned client area
5. **Animated transitions**: Spring physics for smooth movement
6. **Touch support**: Already works, but optimize touch targets (44px min)

### Phase 3 Features
1. **Drag constraints**: Prevent invalid drops (capacity check)
2. **Drag feedback**: Show capacity change in real-time during hover
3. **Batch operations**: "Select 10 clients → drag all"
4. **Drag history**: Visual replay of last 5 drag operations

---

## Dependencies

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Why these specific packages?**
- `core`: Base drag-and-drop logic
- `sortable`: Reordering within lists (routes, clients)
- `utilities`: CSS transform helpers

**Total bundle impact**: ~22KB gzipped

---

## Code Organization

### File structure
```
src/components/
└── DragDropRoutePlanner.tsx (1 file, ~600 lines)
```

**Why single file?**
- All drag logic tightly coupled
- Easier to understand data flow
- For production: split into `components/`, `hooks/`, `types/`

### Suggested refactor for scale
```
src/features/route-planner/
├── components/
│   ├── DraggableClient.tsx
│   ├── DroppableRoute.tsx
│   └── DroppableDay.tsx
├── hooks/
│   ├── useDragHandlers.ts
│   └── useRouteState.ts
├── types/
│   └── index.ts
└── DragDropRoutePlanner.tsx (orchestrator)
```

---

## Summary

This implementation prioritizes:
1. **Clarity**: Easy to understand drag logic
2. **Feedback**: Clear visual indicators at every step
3. **Simplicity**: No premature optimization
4. **Accessibility**: Works with keyboard, screen readers
5. **Maintainability**: Well-commented, typed code

**Total implementation**: ~600 lines including types, comments, styling.

**Not included** (per requirements):
- Backend integration
- Optimization algorithms
- Business rule validation
- State persistence
- Undo/redo
