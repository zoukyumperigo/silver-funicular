import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { undo } from './middleware/undo';
import type { Day, Route, Client, Driver } from '../types';

// ============================================================================
// STORE STATE & ACTIONS
// ============================================================================

interface RouteStore {
  // State
  days: Day[];
  drivers: Driver[];
  unassignedClients: Client[];
  selectedClientId: string | null;

  // Actions - Client Operations
  moveClient: (
    clientId: string,
    fromRouteId: string,
    fromDayId: string,
    toRouteId: string,
    toDayId: string
  ) => void;

  reorderClients: (routeId: string, dayId: string, clientIds: string[]) => void;

  assignClientToRoute: (clientId: string, routeId: string, dayId: string) => void;

  unassignClient: (clientId: string, routeId: string, dayId: string) => void;

  // Actions - Route Operations
  moveRoute: (routeId: string, fromDayId: string, toDayId: string) => void;

  addRoute: (dayId: string, route: Route) => void;

  deleteRoute: (dayId: string, routeId: string) => void;

  updateRoute: (dayId: string, routeId: string, updates: Partial<Route>) => void;

  // Actions - UI State
  setSelectedClient: (clientId: string | null) => void;

  // Actions - Data Management
  loadInitialData: (days: Day[], drivers: Driver[], unassigned: Client[]) => void;

  // Undo/Redo (provided by middleware)
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
}

// ============================================================================
// INITIAL DATA
// ============================================================================

const INITIAL_DAYS: Day[] = [
  {
    id: 'mon',
    label: 'Mon 01',
    date: '2026-01-01',
    routes: [
      {
        id: 'r1',
        driver: 'John Doe',
        driverId: 'd1',
        capacity: 85,
        boxes: 120,
        status: 'draft',
        clients: [
          { id: 'c1', name: 'Acme Corp', boxes: 45, time: '09:00' },
          { id: 'c2', name: 'GlobalTech', boxes: 75, time: '11:30' },
        ],
      },
      {
        id: 'r2',
        driver: 'Sarah Smith',
        driverId: 'd2',
        capacity: 40,
        boxes: 50,
        status: 'draft',
        clients: [{ id: 'c3', name: 'Tech Startups', boxes: 50, time: '10:15' }],
      },
    ],
  },
  {
    id: 'tue',
    label: 'Tue 02',
    date: '2026-01-02',
    routes: [
      {
        id: 'r3',
        driver: 'Mike Johnson',
        driverId: 'd3',
        capacity: 60,
        boxes: 80,
        status: 'draft',
        clients: [
          { id: 'c4', name: 'Beta Industries', boxes: 30, time: '08:00' },
          { id: 'c5', name: 'Delta Corp', boxes: 50, time: '14:00' },
        ],
      },
    ],
  },
  {
    id: 'wed',
    label: 'Wed 03',
    date: '2026-01-03',
    routes: [],
  },
  {
    id: 'thu',
    label: 'Thu 04',
    date: '2026-01-04',
    routes: [],
  },
  {
    id: 'fri',
    label: 'Fri 05',
    date: '2026-01-05',
    routes: [],
  },
  {
    id: 'sat',
    label: 'Sat 06',
    date: '2026-01-06',
    routes: [],
  },
  {
    id: 'sun',
    label: 'Sun 07',
    date: '2026-01-07',
    routes: [],
  },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', name: 'John Doe', maxCapacity: 150, status: 'active' },
  { id: 'd2', name: 'Sarah Smith', maxCapacity: 120, status: 'active' },
  { id: 'd3', name: 'Mike Johnson', maxCapacity: 140, status: 'active' },
  { id: 'd4', name: 'Lisa Chen', maxCapacity: 130, status: 'active' },
];

const INITIAL_UNASSIGNED: Client[] = [
  { id: 'c6', name: 'Omega Systems', boxes: 65, time: '10:00' },
  { id: 'c7', name: 'Zeta Corp', boxes: 40, time: '13:00' },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useRouteStore = create<RouteStore>()(
  undo(
    immer((set, get) => ({
      // Initial state
      days: INITIAL_DAYS,
      drivers: INITIAL_DRIVERS,
      unassignedClients: INITIAL_UNASSIGNED,
      selectedClientId: null,

      // ========================================================================
      // CLIENT OPERATIONS
      // ========================================================================

      moveClient: (clientId, fromRouteId, fromDayId, toRouteId, toDayId) => {
        set(
          (state) => {
            // Find source route and remove client
            const sourceDay = state.days.find((d) => d.id === fromDayId);
            const sourceRoute = sourceDay?.routes.find((r) => r.id === fromRouteId);
            const clientIndex = sourceRoute?.clients.findIndex((c) => c.id === clientId);

            if (!sourceRoute || clientIndex === undefined || clientIndex === -1) {
              console.error('Source route or client not found');
              return;
            }

            const [client] = sourceRoute.clients.splice(clientIndex, 1);

            // Recalculate source route capacity
            sourceRoute.boxes = sourceRoute.clients.reduce(
              (sum, c) => sum + c.boxes,
              0
            );
            sourceRoute.capacity = Math.round(
              (sourceRoute.boxes / 150) * 100 // Assuming 150 max capacity
            );

            // Find target route and add client
            const targetDay = state.days.find((d) => d.id === toDayId);
            const targetRoute = targetDay?.routes.find((r) => r.id === toRouteId);

            if (!targetRoute) {
              console.error('Target route not found');
              // Restore client to source
              sourceRoute.clients.splice(clientIndex, 0, client);
              return;
            }

            targetRoute.clients.push(client);

            // Recalculate target route capacity
            targetRoute.boxes = targetRoute.clients.reduce(
              (sum, c) => sum + c.boxes,
              0
            );
            targetRoute.capacity = Math.round(
              (targetRoute.boxes / 150) * 100
            );
          },
          false,
          `moveClient:${clientId}:${fromRouteId}→${toRouteId}`
        );
      },

      reorderClients: (routeId, dayId, clientIds) => {
        set(
          (state) => {
            const day = state.days.find((d) => d.id === dayId);
            const route = day?.routes.find((r) => r.id === routeId);

            if (!route) return;

            // Create new clients array in specified order
            const reordered = clientIds
              .map((id) => route.clients.find((c) => c.id === id))
              .filter((c): c is Client => c !== undefined);

            route.clients = reordered;
          },
          false,
          `reorderClients:${routeId}`
        );
      },

      assignClientToRoute: (clientId, routeId, dayId) => {
        set(
          (state) => {
            // Find client in unassigned pool
            const clientIndex = state.unassignedClients.findIndex(
              (c) => c.id === clientId
            );

            if (clientIndex === -1) return;

            const [client] = state.unassignedClients.splice(clientIndex, 1);

            // Find target route
            const day = state.days.find((d) => d.id === dayId);
            const route = day?.routes.find((r) => r.id === routeId);

            if (!route) {
              // Restore client to unassigned
              state.unassignedClients.splice(clientIndex, 0, client);
              return;
            }

            route.clients.push(client);

            // Recalculate capacity
            route.boxes = route.clients.reduce((sum, c) => sum + c.boxes, 0);
            route.capacity = Math.round((route.boxes / 150) * 100);
          },
          false,
          `assignClient:${clientId}→${routeId}`
        );
      },

      unassignClient: (clientId, routeId, dayId) => {
        set(
          (state) => {
            const day = state.days.find((d) => d.id === dayId);
            const route = day?.routes.find((r) => r.id === routeId);
            const clientIndex = route?.clients.findIndex((c) => c.id === clientId);

            if (!route || clientIndex === undefined || clientIndex === -1) return;

            const [client] = route.clients.splice(clientIndex, 1);
            state.unassignedClients.push(client);

            // Recalculate capacity
            route.boxes = route.clients.reduce((sum, c) => sum + c.boxes, 0);
            route.capacity = Math.round((route.boxes / 150) * 100);
          },
          false,
          `unassignClient:${clientId}`
        );
      },

      // ========================================================================
      // ROUTE OPERATIONS
      // ========================================================================

      moveRoute: (routeId, fromDayId, toDayId) => {
        set(
          (state) => {
            // Find and remove route from source day
            const sourceDay = state.days.find((d) => d.id === fromDayId);
            const routeIndex = sourceDay?.routes.findIndex((r) => r.id === routeId);

            if (!sourceDay || routeIndex === undefined || routeIndex === -1) {
              console.error('Source day or route not found');
              return;
            }

            const [route] = sourceDay.routes.splice(routeIndex, 1);

            // Add route to target day
            const targetDay = state.days.find((d) => d.id === toDayId);

            if (!targetDay) {
              console.error('Target day not found');
              // Restore route to source
              sourceDay.routes.splice(routeIndex, 0, route);
              return;
            }

            targetDay.routes.push(route);
          },
          false,
          `moveRoute:${routeId}:${fromDayId}→${toDayId}`
        );
      },

      addRoute: (dayId, route) => {
        set(
          (state) => {
            const day = state.days.find((d) => d.id === dayId);
            if (!day) return;

            day.routes.push(route);
          },
          false,
          `addRoute:${route.id}`
        );
      },

      deleteRoute: (dayId, routeId) => {
        set(
          (state) => {
            const day = state.days.find((d) => d.id === dayId);
            const routeIndex = day?.routes.findIndex((r) => r.id === routeId);

            if (!day || routeIndex === undefined || routeIndex === -1) return;

            // Move clients back to unassigned pool
            const [route] = day.routes.splice(routeIndex, 1);
            state.unassignedClients.push(...route.clients);
          },
          false,
          `deleteRoute:${routeId}`
        );
      },

      updateRoute: (dayId, routeId, updates) => {
        set(
          (state) => {
            const day = state.days.find((d) => d.id === dayId);
            const route = day?.routes.find((r) => r.id === routeId);

            if (!route) return;

            Object.assign(route, updates);
          },
          false,
          `updateRoute:${routeId}`
        );
      },

      // ========================================================================
      // UI STATE
      // ========================================================================

      setSelectedClient: (clientId) => {
        set({ selectedClientId: clientId }, false, 'setSelectedClient');
      },

      // ========================================================================
      // DATA MANAGEMENT
      // ========================================================================

      loadInitialData: (days, drivers, unassigned) => {
        set(
          {
            days,
            drivers,
            unassignedClients: unassigned,
          },
          true,
          'loadInitialData'
        );
      },

      // Undo/Redo methods are provided by middleware
      undo: () => {},
      redo: () => {},
      clearHistory: () => {},
      canUndo: false,
      canRedo: false,
      historySize: 0,
    })),
    { limit: 50 } // Keep last 50 actions
  )
);

// ============================================================================
// SELECTORS (for optimized access)
// ============================================================================

/**
 * Get a specific day by ID
 */
export const selectDay = (dayId: string) => (state: RouteStore) =>
  state.days.find((d) => d.id === dayId);

/**
 * Get a specific route by day and route ID
 */
export const selectRoute = (dayId: string, routeId: string) => (state: RouteStore) => {
  const day = state.days.find((d) => d.id === dayId);
  return day?.routes.find((r) => r.id === routeId);
};

/**
 * Get all routes for a specific day
 */
export const selectDayRoutes = (dayId: string) => (state: RouteStore) => {
  const day = state.days.find((d) => d.id === dayId);
  return day?.routes ?? [];
};

/**
 * Get a specific client from any route
 */
export const selectClient = (clientId: string) => (state: RouteStore) => {
  for (const day of state.days) {
    for (const route of day.routes) {
      const client = route.clients.find((c) => c.id === clientId);
      if (client) return client;
    }
  }
  return state.unassignedClients.find((c) => c.id === clientId);
};

/**
 * Get total boxes for a specific day
 */
export const selectDayBoxCount = (dayId: string) => (state: RouteStore) => {
  const day = state.days.find((d) => d.id === dayId);
  return day?.routes.reduce((sum, route) => sum + route.boxes, 0) ?? 0;
};

/**
 * Check if a driver is available on a specific day
 */
export const selectDriverAvailability =
  (driverId: string, dayId: string) => (state: RouteStore) => {
    const day = state.days.find((d) => d.id === dayId);
    return !day?.routes.some((r) => r.driverId === driverId);
  };
