import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Filter, Zap, MoreVertical, Box, Clock, User, ChevronRight, GripVertical } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Client {
  id: string;
  name: string;
  boxes: number;
  time: string;
}

interface Route {
  id: string;
  driver: string;
  capacity: number;
  boxes: number;
  clients: Client[];
}

interface Day {
  id: string;
  label: string;
  routes: Route[];
}

type DragItem =
  | { type: 'client'; clientId: string; routeId: string; dayId: string }
  | { type: 'route'; routeId: string; dayId: string };

// ============================================================================
// MOCK DATA
// ============================================================================

const INITIAL_DAYS: Day[] = [
  {
    id: 'mon',
    label: 'Mon 01',
    routes: [
      {
        id: 'r1',
        driver: 'John Doe',
        capacity: 85,
        boxes: 120,
        clients: [
          { id: 'c1', name: 'Acme Corp', boxes: 45, time: '09:00' },
          { id: 'c2', name: 'GlobalTech', boxes: 75, time: '11:30' },
        ],
      },
      {
        id: 'r2',
        driver: 'Sarah Smith',
        capacity: 40,
        boxes: 50,
        clients: [{ id: 'c3', name: 'Tech Startups', boxes: 50, time: '10:15' }],
      },
    ],
  },
  {
    id: 'tue',
    label: 'Tue 02',
    routes: [
      {
        id: 'r3',
        driver: 'Mike Johnson',
        capacity: 60,
        boxes: 80,
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
    routes: [],
  },
  {
    id: 'thu',
    label: 'Thu 04',
    routes: [],
  },
  {
    id: 'fri',
    label: 'Fri 05',
    routes: [],
  },
  {
    id: 'sat',
    label: 'Sat 06',
    routes: [],
  },
  {
    id: 'sun',
    label: 'Sun 07',
    routes: [],
  },
];

// ============================================================================
// DRAGGABLE CLIENT CARD
// ============================================================================

interface DraggableClientProps {
  client: Client;
  routeId: string;
  dayId: string;
  onClick: (client: Client) => void;
}

const DraggableClient: React.FC<DraggableClientProps> = ({ client, routeId, dayId, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: client.id,
    data: { type: 'client', clientId: client.id, routeId, dayId } as DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white border-2 p-3 rounded-lg shadow-sm transition-all mb-2 ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-0.5"
        >
          <GripVertical size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onClick(client)}>
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold text-slate-700 truncate">{client.name}</span>
            <MoreVertical size={14} className="text-slate-400" />
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <Box size={12} /> {client.boxes}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} /> {client.time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DROPPABLE ROUTE CARD
// ============================================================================

interface DroppableRouteProps {
  route: Route;
  dayId: string;
  onClientClick: (client: Client) => void;
  isOver?: boolean;
}

const DroppableRoute: React.FC<DroppableRouteProps> = ({ route, dayId, onClientClick, isOver }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: route.id,
    data: { type: 'route', routeId: route.id, dayId } as DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-50 border-2 rounded-lg p-3 mb-4 transition-all ${
        isDragging
          ? 'border-blue-500 shadow-lg'
          : isOver
          ? 'border-green-400 bg-green-50 shadow-md'
          : 'border-slate-200 hover:shadow-md'
      }`}
    >
      {/* Route Header with Drag Handle */}
      <div className="flex items-center gap-2 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <GripVertical size={16} />
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <User size={12} /> {route.driver}
          </h4>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all ${route.capacity > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${route.capacity}%` }}
            />
          </div>
        </div>

        <span className="text-[10px] font-mono font-medium text-slate-500">{route.capacity}%</span>
      </div>

      {/* Droppable Client Area */}
      <SortableContext items={route.clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-1 min-h-[60px] rounded-md p-2 -m-2 ${isOver ? 'bg-blue-50' : ''}`}>
          {route.clients.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-md">
              Drop clients here
            </div>
          ) : (
            route.clients.map((client) => (
              <DraggableClient
                key={client.id}
                client={client}
                routeId={route.id}
                dayId={dayId}
                onClick={onClientClick}
              />
            ))
          )}
        </div>
      </SortableContext>

      <button className="w-full py-2 mt-2 border-dashed border-2 border-slate-200 rounded text-[10px] text-slate-400 hover:bg-white hover:border-slate-300 transition-colors">
        + Add Stop
      </button>
    </div>
  );
};

// ============================================================================
// DROPPABLE DAY COLUMN
// ============================================================================

interface DroppableDayProps {
  day: Day;
  onClientClick: (client: Client) => void;
  isOver?: boolean;
}

const DroppableDay: React.FC<DroppableDayProps> = ({ day, onClientClick, isOver }) => {
  const { setNodeRef } = useSortable({
    id: day.id,
    data: { type: 'day', dayId: day.id },
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col">
      {/* Day Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-bold text-sm text-slate-700">{day.label}</h3>
        <span className="text-[10px] px-2 py-0.5 bg-slate-200 rounded-full font-bold text-slate-500">
          {day.routes.reduce((sum, r) => sum + r.boxes, 0)} BOXES
        </span>
      </div>

      {/* Route Container */}
      <SortableContext items={day.routes.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div
          className={`flex-1 overflow-y-auto pr-2 custom-scrollbar rounded-lg p-2 -m-2 transition-colors ${
            isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          {day.routes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white">
              Drop routes here
            </div>
          ) : (
            day.routes.map((route) => (
              <DroppableRoute
                key={route.id}
                route={route}
                dayId={day.id}
                onClientClick={onClientClick}
              />
            ))
          )}
          <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-50 transition-colors mt-2">
            + Create New Route
          </button>
        </div>
      </SortableContext>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DragDropRoutePlanner() {
  const [days, setDays] = useState<Day[]>(INITIAL_DAYS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (prevents accidental drags)
      },
    })
  );

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as DragItem);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setOverId(null);

    if (!over) return;

    const activeData = active.data.current as DragItem;
    const overData = over.data.current as any;

    // -------------------------------------------------------------------------
    // CLIENT DRAG: Move client between routes or reorder within route
    // -------------------------------------------------------------------------
    if (activeData?.type === 'client') {
      const sourceRouteId = activeData.routeId;
      const sourceDayId = activeData.dayId;
      const clientId = activeData.clientId;

      // Determine target route
      let targetRouteId: string;
      let targetDayId: string;

      if (overData?.type === 'client') {
        // Dropped on another client - use that client's route
        targetRouteId = overData.routeId;
        targetDayId = overData.dayId;
      } else if (overData?.type === 'route') {
        // Dropped on route header/area
        targetRouteId = overData.routeId;
        targetDayId = overData.dayId;
      } else if (over.id === sourceRouteId) {
        // Dropped back on same route
        targetRouteId = sourceRouteId;
        targetDayId = sourceDayId;
      } else {
        return; // Invalid drop target
      }

      // Update state
      setDays((prevDays) => {
        const newDays = JSON.parse(JSON.stringify(prevDays)); // Deep clone

        // Find source route and remove client
        const sourceDay = newDays.find((d: Day) => d.id === sourceDayId);
        const sourceRoute = sourceDay?.routes.find((r: Route) => r.id === sourceRouteId);
        const client = sourceRoute?.clients.find((c: Client) => c.id === clientId);

        if (!client) return prevDays;

        sourceRoute.clients = sourceRoute.clients.filter((c: Client) => c.id !== clientId);

        // Find target route and add client
        const targetDay = newDays.find((d: Day) => d.id === targetDayId);
        const targetRoute = targetDay?.routes.find((r: Route) => r.id === targetRouteId);

        if (!targetRoute) return prevDays;

        // Add to end of target route (or implement sorting logic here)
        targetRoute.clients.push(client);

        return newDays;
      });
    }

    // -------------------------------------------------------------------------
    // ROUTE DRAG: Move route between days
    // -------------------------------------------------------------------------
    if (activeData?.type === 'route') {
      const sourceDayId = activeData.dayId;
      const routeId = activeData.routeId;

      // Determine target day
      let targetDayId: string;

      if (overData?.type === 'day') {
        targetDayId = overData.dayId;
      } else if (overData?.type === 'route') {
        targetDayId = overData.dayId;
      } else if (overData?.dayId) {
        targetDayId = overData.dayId;
      } else {
        // Try to find day by ID
        const targetDay = days.find((d) => d.id === over.id);
        if (targetDay) {
          targetDayId = targetDay.id;
        } else {
          return; // Invalid drop
        }
      }

      if (sourceDayId === targetDayId) return; // Same day, no action

      // Update state
      setDays((prevDays) => {
        const newDays = JSON.parse(JSON.stringify(prevDays)); // Deep clone

        // Find and remove route from source day
        const sourceDay = newDays.find((d: Day) => d.id === sourceDayId);
        const route = sourceDay?.routes.find((r: Route) => r.id === routeId);

        if (!route) return prevDays;

        sourceDay.routes = sourceDay.routes.filter((r: Route) => r.id !== routeId);

        // Add route to target day
        const targetDay = newDays.find((d: Day) => d.id === targetDayId);
        if (!targetDay) return prevDays;

        targetDay.routes.push(route);

        return newDays;
      });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-lg tracking-tight">
                RouteFlow <span className="text-slate-400 font-normal">/ Daily Planning</span>
              </h1>
              <div className="flex items-center bg-slate-100 rounded-md px-3 py-1.5 gap-2 border border-slate-200">
                <Calendar size={16} className="text-slate-500" />
                <span className="text-sm font-medium">Jan 01 - Jan 07, 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
                <Filter size={16} /> Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                <Zap size={16} fill="currentColor" /> Optimize Routes
              </button>
            </div>
          </header>

          {/* PLANNING GRID */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden flex p-4 gap-4">
            <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {days.map((day) => (
                <DroppableDay
                  key={day.id}
                  day={day}
                  onClientClick={setSelectedClient}
                  isOver={overId === day.id}
                />
              ))}
            </SortableContext>
          </main>
        </div>

        {/* DETAIL PANEL */}
        <aside
          className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-20 ${
            selectedClient ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedClient && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800">Stop Details</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Client Name
                  </label>
                  <p className="text-lg font-bold text-slate-900">{selectedClient.name}</p>
                </section>
                <div className="grid grid-cols-2 gap-4">
                  <section className="bg-slate-50 p-3 rounded">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">Boxes</label>
                    <p className="text-xl font-mono font-bold text-blue-600">{selectedClient.boxes}</p>
                  </section>
                  <section className="bg-slate-50 p-3 rounded">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">Window</label>
                    <p className="text-xl font-mono font-bold text-slate-700">{selectedClient.time}</p>
                  </section>
                </div>
                <section>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Delivery Notes
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-md p-2 text-sm text-slate-600 h-32 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Add specific instructions here..."
                  ></textarea>
                </section>
                <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg mt-auto hover:bg-slate-800 transition-colors">
                  Update Stop
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* DRAG OVERLAY (Ghost Preview) */}
        <DragOverlay>
          {activeItem?.type === 'client' && (
            <div className="bg-white border-2 border-blue-500 p-3 rounded-lg shadow-2xl w-64 opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Dragging client...</span>
              </div>
            </div>
          )}
          {activeItem?.type === 'route' && (
            <div className="bg-slate-50 border-2 border-blue-500 p-3 rounded-lg shadow-2xl w-64 opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Dragging route...</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DndContext>
  );
}
