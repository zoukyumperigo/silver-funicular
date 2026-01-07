import type { Day, Route, Client } from '../types';

// ============================================================================
// OPTIMIZATION RESULT TYPES
// ============================================================================

export interface OptimizationResult {
  success: boolean;
  executionTime: number;
  changes: OptimizationChange[];
  optimizedDays: Day[];
  summary: {
    totalDistanceBefore: number;
    totalDistanceAfter: number;
    distanceSaved: number;
    savingsPercent: number;
    routesOptimized: number;
    clientsMoved: number;
  };
}

export interface OptimizationChange {
  type: 'client_moved' | 'sequence_changed' | 'route_balanced';
  clientId?: string;
  clientName?: string;
  fromRoute?: string;
  toRoute?: string;
  routeId?: string;
  reason: string;
  impact: string;
}

export interface OptimizationOptions {
  mode: 'balance_routes' | 'optimize_day' | 'optimize_all';
  dayId?: string;
  respectTimeWindows: boolean;
  balanceWorkload: boolean;
  maxRouteCapacity: number;
}

// ============================================================================
// DISTANCE CALCULATION (Haversine approximation)
// ============================================================================

/**
 * Simple distance calculation for optimization
 * Uses random values for demo - replace with actual coordinates in production
 */
function calculateDistance(clientA: Client, clientB: Client): number {
  // Mock distance calculation - in production, use actual coordinates
  // Haversine formula with lat/lng coordinates
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const distanceHash = hash(clientA.id + clientB.id) % 50;
  return distanceHash + 5; // 5-55 miles
}

function calculateRouteDistance(clients: Client[]): number {
  if (clients.length === 0) return 0;

  let totalDistance = 0;
  // Distance from depot to first client (assumed 10 miles)
  totalDistance += 10;

  // Distance between clients
  for (let i = 0; i < clients.length - 1; i++) {
    totalDistance += calculateDistance(clients[i], clients[i + 1]);
  }

  // Distance from last client back to depot
  totalDistance += 10;

  return Math.round(totalDistance * 10) / 10;
}

// ============================================================================
// OPTIMIZATION ALGORITHMS
// ============================================================================

/**
 * Balance Routes Mode
 * Redistributes clients across routes to balance workload
 */
function balanceRoutes(day: Day): {
  optimizedDay: Day;
  changes: OptimizationChange[];
} {
  const changes: OptimizationChange[] = [];
  const optimizedDay = JSON.parse(JSON.stringify(day)) as Day;

  if (optimizedDay.routes.length < 2) {
    return { optimizedDay, changes };
  }

  // Calculate average clients per route
  const totalClients = optimizedDay.routes.reduce(
    (sum, r) => sum + r.clients.length,
    0
  );
  const avgClientsPerRoute = totalClients / optimizedDay.routes.length;

  // Find overloaded and underloaded routes
  const overloaded = optimizedDay.routes.filter(
    (r) => r.clients.length > avgClientsPerRoute * 1.2
  );
  const underloaded = optimizedDay.routes.filter(
    (r) => r.clients.length < avgClientsPerRoute * 0.8
  );

  // Move clients from overloaded to underloaded
  for (const sourceRoute of overloaded) {
    while (
      sourceRoute.clients.length > avgClientsPerRoute &&
      underloaded.length > 0
    ) {
      const targetRoute = underloaded[0];
      const client = sourceRoute.clients.pop();

      if (!client) break;

      targetRoute.clients.push(client);

      // Recalculate capacities
      sourceRoute.boxes = sourceRoute.clients.reduce(
        (sum, c) => sum + c.boxes,
        0
      );
      sourceRoute.capacity = Math.round((sourceRoute.boxes / 150) * 100);

      targetRoute.boxes = targetRoute.clients.reduce(
        (sum, c) => sum + c.boxes,
        0
      );
      targetRoute.capacity = Math.round((targetRoute.boxes / 150) * 100);

      changes.push({
        type: 'client_moved',
        clientId: client.id,
        clientName: client.name,
        fromRoute: sourceRoute.driver,
        toRoute: targetRoute.driver,
        reason: 'Balance workload across routes',
        impact: `Route ${sourceRoute.driver}: ${sourceRoute.clients.length + 1} → ${sourceRoute.clients.length} stops`,
      });

      // Check if target is now balanced
      if (targetRoute.clients.length >= avgClientsPerRoute) {
        underloaded.shift();
      }
    }
  }

  return { optimizedDay, changes };
}

/**
 * Optimize Day Mode
 * Optimizes all routes for a specific day (balance + sequence)
 */
function optimizeDay(day: Day): {
  optimizedDay: Day;
  changes: OptimizationChange[];
} {
  const { optimizedDay, changes } = balanceRoutes(day);

  // Optimize sequence for each route using simple nearest-neighbor
  for (const route of optimizedDay.routes) {
    if (route.clients.length <= 1) continue;

    const originalSequence = [...route.clients];
    const optimizedSequence: Client[] = [];
    const remaining = [...route.clients];

    // Start with first client (arbitrary)
    optimizedSequence.push(remaining.shift()!);

    // Nearest neighbor heuristic
    while (remaining.length > 0) {
      const current = optimizedSequence[optimizedSequence.length - 1];
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const distance = calculateDistance(current, remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      optimizedSequence.push(remaining.splice(nearestIndex, 1)[0]);
    }

    // Check if sequence changed
    const sequenceChanged = originalSequence.some(
      (client, idx) => client.id !== optimizedSequence[idx].id
    );

    if (sequenceChanged) {
      route.clients = optimizedSequence;

      const distanceBefore = calculateRouteDistance(originalSequence);
      const distanceAfter = calculateRouteDistance(optimizedSequence);
      const saved = distanceBefore - distanceAfter;

      if (saved > 0.5) {
        changes.push({
          type: 'sequence_changed',
          routeId: route.id,
          reason: 'Optimized stop sequence using nearest-neighbor',
          impact: `Saved ${saved.toFixed(1)} miles`,
        });
      }
    }
  }

  return { optimizedDay, changes };
}

/**
 * Optimize All Mode
 * Optimizes all days in the week
 */
function optimizeAll(days: Day[]): {
  optimizedDays: Day[];
  changes: OptimizationChange[];
} {
  const optimizedDays: Day[] = [];
  const allChanges: OptimizationChange[] = [];

  for (const day of days) {
    if (day.routes.length === 0) {
      optimizedDays.push(day);
      continue;
    }

    const { optimizedDay, changes } = optimizeDay(day);
    optimizedDays.push(optimizedDay);
    allChanges.push(...changes);
  }

  return { optimizedDays, changes: allChanges };
}

// ============================================================================
// MAIN OPTIMIZATION SERVICE
// ============================================================================

export class OptimizationService {
  /**
   * Run optimization based on mode and options
   */
  static async optimize(
    days: Day[],
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    const startTime = performance.now();

    let optimizedDays: Day[];
    let changes: OptimizationChange[];

    try {
      // Simulate async processing (in production, this would be actual computation)
      await new Promise((resolve) => setTimeout(resolve, 800));

      switch (options.mode) {
        case 'balance_routes': {
          if (!options.dayId) {
            throw new Error('dayId required for balance_routes mode');
          }
          const day = days.find((d) => d.id === options.dayId);
          if (!day) {
            throw new Error(`Day ${options.dayId} not found`);
          }
          const result = balanceRoutes(day);
          optimizedDays = days.map((d) =>
            d.id === options.dayId ? result.optimizedDay : d
          );
          changes = result.changes;
          break;
        }

        case 'optimize_day': {
          if (!options.dayId) {
            throw new Error('dayId required for optimize_day mode');
          }
          const day = days.find((d) => d.id === options.dayId);
          if (!day) {
            throw new Error(`Day ${options.dayId} not found`);
          }
          const result = optimizeDay(day);
          optimizedDays = days.map((d) =>
            d.id === options.dayId ? result.optimizedDay : d
          );
          changes = result.changes;
          break;
        }

        case 'optimize_all': {
          const result = optimizeAll(days);
          optimizedDays = result.optimizedDays;
          changes = result.changes;
          break;
        }

        default:
          throw new Error(`Unknown optimization mode: ${options.mode}`);
      }

      const executionTime = performance.now() - startTime;

      // Calculate summary metrics
      const totalDistanceBefore = days.reduce((sum, day) => {
        return (
          sum +
          day.routes.reduce((routeSum, route) => {
            return routeSum + calculateRouteDistance(route.clients);
          }, 0)
        );
      }, 0);

      const totalDistanceAfter = optimizedDays.reduce((sum, day) => {
        return (
          sum +
          day.routes.reduce((routeSum, route) => {
            return routeSum + calculateRouteDistance(route.clients);
          }, 0)
        );
      }, 0);

      const distanceSaved = totalDistanceBefore - totalDistanceAfter;
      const savingsPercent =
        totalDistanceBefore > 0
          ? (distanceSaved / totalDistanceBefore) * 100
          : 0;

      const routesOptimized = new Set(
        changes
          .filter((c) => c.type === 'sequence_changed')
          .map((c) => c.routeId)
      ).size;

      const clientsMoved = changes.filter((c) => c.type === 'client_moved')
        .length;

      return {
        success: true,
        executionTime,
        changes,
        optimizedDays,
        summary: {
          totalDistanceBefore: Math.round(totalDistanceBefore * 10) / 10,
          totalDistanceAfter: Math.round(totalDistanceAfter * 10) / 10,
          distanceSaved: Math.round(distanceSaved * 10) / 10,
          savingsPercent: Math.round(savingsPercent * 10) / 10,
          routesOptimized,
          clientsMoved,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error('Optimization error:', error);

      return {
        success: false,
        executionTime,
        changes: [],
        optimizedDays: days,
        summary: {
          totalDistanceBefore: 0,
          totalDistanceAfter: 0,
          distanceSaved: 0,
          savingsPercent: 0,
          routesOptimized: 0,
          clientsMoved: 0,
        },
      };
    }
  }
}
