// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface Client {
  id: string;
  name: string;
  boxes: number;
  time: string;
  address?: string;
  notes?: string;
}

export interface Route {
  id: string;
  driver: string;
  driverId: string;
  capacity: number;
  boxes: number;
  clients: Client[];
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed';
}

export interface Day {
  id: string;
  label: string;
  date: string; // ISO date format
  routes: Route[];
}

export interface Driver {
  id: string;
  name: string;
  maxCapacity: number;
  status: 'active' | 'inactive' | 'unavailable';
}

// ============================================================================
// STATE HISTORY TYPES
// ============================================================================

export interface HistoryEntry {
  state: PlanningState;
  timestamp: number;
  action: string;
}

export interface PlanningState {
  days: Day[];
  drivers: Driver[];
  unassignedClients: Client[];
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface MoveClientAction {
  type: 'MOVE_CLIENT';
  clientId: string;
  fromRouteId: string;
  fromDayId: string;
  toRouteId: string;
  toDayId: string;
}

export interface MoveRouteAction {
  type: 'MOVE_ROUTE';
  routeId: string;
  fromDayId: string;
  toDayId: string;
}

export interface ReorderClientsAction {
  type: 'REORDER_CLIENTS';
  routeId: string;
  dayId: string;
  clientIds: string[];
}

export interface AddRouteAction {
  type: 'ADD_ROUTE';
  dayId: string;
  route: Route;
}

export interface DeleteRouteAction {
  type: 'DELETE_ROUTE';
  dayId: string;
  routeId: string;
}

export interface UpdateRouteAction {
  type: 'UPDATE_ROUTE';
  dayId: string;
  routeId: string;
  updates: Partial<Route>;
}

export type Action =
  | MoveClientAction
  | MoveRouteAction
  | ReorderClientsAction
  | AddRouteAction
  | DeleteRouteAction
  | UpdateRouteAction;
