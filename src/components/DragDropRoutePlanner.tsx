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
import {
  Calendar,
  Filter,
  Zap,
  MoreVertical,
  Box,
  Clock,
  User,
  ChevronRight,
  GripVertical,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useRouteStore, selectDayBoxCount } from '../stores/useRouteStore';
import type { Client, Day, Route } from '../types';
import { OptimizationService, OptimizationResult } from '../services/optimizationService';
import { OptimizationModal } from './OptimizationModal';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type DragItem =
  | { type: 'client'; clientId: string; routeId: string; dayId: string }
  | { type: 'route'; routeId: string; dayId: string };

// ============================================================================
// DRAGGABLE CLIENT CARD
// ============================================================================

interface DraggableClientProps {
  client: Client;
  routeId: string;
  dayId: string;
  onClick: (client: Client) => void;
}

const DraggableClient: React.FC<DraggableClientProps> = ({
  client,
  routeId,
  dayId,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
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
        isDragging
          ? 'border-blue-500 shadow-lg'
          : 'border-slate-200 hover:border-blue-300'
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
            <span className="text-xs font-bold text-slate-700 truncate">
              {client.name}
            </span>
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

const DroppableRoute: React.FC<DroppableRouteProps> = ({
  route,
  dayId,
  onClientClick,
  isOver,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
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
              className={`h-full transition-all ${
                route.capacity > 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(route.capacity, 100)}%` }}
            />
          </div>
        </div>

        <span className="text-[10px] font-mono font-medium text-slate-500">
          {route.capacity}%
        </span>
      </div>

      {/* Droppable Client Area */}
      <SortableContext
        items={route.clients.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`space-y-1 min-h-[60px] rounded-md p-2 -m-2 ${
            isOver ? 'bg-blue-50' : ''
          }`}
        >
          {route.clients.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-md">
              Solte clientes aqui
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
        + Adicionar Parada
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

  // Use selector for optimized box count calculation
  const boxCount = useRouteStore(selectDayBoxCount(day.id));

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col">
      {/* Day Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-bold text-sm text-slate-700">{day.label}</h3>
        <span className="text-[10px] px-2 py-0.5 bg-slate-200 rounded-full font-bold text-slate-500">
          {boxCount} CAIXAS
        </span>
      </div>

      {/* Route Container */}
      <SortableContext
        items={day.routes.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`flex-1 overflow-y-auto pr-2 custom-scrollbar rounded-lg p-2 -m-2 transition-colors ${
            isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          {day.routes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white">
              Solte rotas aqui
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
            + Criar Nova Rota
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
  // State from Zustand store
  const days = useRouteStore((state) => state.days);
  const selectedClientId = useRouteStore((state) => state.selectedClientId);
  const moveClient = useRouteStore((state) => state.moveClient);
  const moveRoute = useRouteStore((state) => state.moveRoute);
  const setSelectedClient = useRouteStore((state) => state.setSelectedClient);
  const applyOptimization = useRouteStore((state) => state.applyOptimization);
  const undo = useRouteStore((state) => state.undo);
  const redo = useRouteStore((state) => state.redo);
  const canUndo = useRouteStore((state) => state.canUndo);
  const canRedo = useRouteStore((state) => state.canRedo);

  // Local UI state for drag operations
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Optimization modal state
  const [optimizationModalOpen, setOptimizationModalOpen] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [pendingOptimizedDays, setPendingOptimizedDays] = useState<Day[] | null>(null);

  // Find selected client details
  const selectedClient = selectedClientId
    ? days
        .flatMap((d) => d.routes.flatMap((r) => r.clients))
        .find((c) => c.id === selectedClientId)
    : null;

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
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
    // CLIENT DRAG: Move client between routes
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
        return;
      } else {
        return; // Invalid drop target
      }

      // Only move if different route
      if (sourceRouteId !== targetRouteId || sourceDayId !== targetDayId) {
        moveClient(clientId, sourceRouteId, sourceDayId, targetRouteId, targetDayId);
      }
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

      // Only move if different day
      if (sourceDayId !== targetDayId) {
        moveRoute(routeId, sourceDayId, targetDayId);
      }
    }
  };

  // ============================================================================
  // KEYBOARD HANDLERS
  // ============================================================================

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Z = Undo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo) undo();
    }

    // Cmd/Ctrl + Shift + Z = Redo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      if (canRedo) redo();
    }

    // Cmd/Ctrl + Y = Redo (alternative)
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      e.preventDefault();
      if (canRedo) redo();
    }
  };

  // ============================================================================
  // OPTIMIZATION HANDLERS
  // ============================================================================

  const handleOptimizeClick = async () => {
    setOptimizationModalOpen(true);
    setOptimizationLoading(true);
    setOptimizationResult(null);
    setPendingOptimizedDays(null);

    try {
      // Run optimization service
      const result = await OptimizationService.optimize(days, {
        mode: 'optimize_all',
        respectTimeWindows: true,
        balanceWorkload: true,
        maxRouteCapacity: 100,
      });

      setOptimizationResult(result);

      if (result.success && result.optimizedDays) {
        // Store optimized days for later application
        setPendingOptimizedDays(result.optimizedDays);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      setOptimizationResult({
        success: false,
        executionTime: 0,
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
      });
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleAcceptOptimization = () => {
    if (pendingOptimizedDays) {
      // Apply optimization to store (this creates a single undo point)
      applyOptimization(pendingOptimizedDays);
    }
    setOptimizationModalOpen(false);
    setOptimizationResult(null);
    setPendingOptimizedDays(null);
  };

  const handleCancelOptimization = () => {
    setOptimizationModalOpen(false);
    setOptimizationResult(null);
    setPendingOptimizedDays(null);
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
      <div
        className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-lg tracking-tight">
                RouteFlow{' '}
                <span className="text-slate-400 font-normal">/ Planejamento Diário</span>
              </h1>
              <div className="flex items-center bg-slate-100 rounded-md px-3 py-1.5 gap-2 border border-slate-200">
                <Calendar size={16} className="text-slate-500" />
                <span className="text-sm font-medium">Jan 01 - Jan 07, 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Undo/Redo Buttons */}
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  canUndo
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Desfazer (Cmd/Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  canRedo
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Refazer (Cmd/Ctrl+Shift+Z)"
              >
                <Redo2 size={16} />
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1" />

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
                <Filter size={16} /> Filtros
              </button>
              <button
                onClick={handleOptimizeClick}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Zap size={16} fill="currentColor" /> Otimizar Rotas
              </button>
            </div>
          </header>

          {/* PLANNING GRID */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden flex p-4 gap-4">
            <SortableContext
              items={days.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {days.map((day) => (
                <DroppableDay
                  key={day.id}
                  day={day}
                  onClientClick={(client) => setSelectedClient(client.id)}
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
                <h2 className="font-bold text-slate-800">Detalhes da Parada</h2>
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
                    Nome do Cliente
                  </label>
                  <p className="text-lg font-bold text-slate-900">
                    {selectedClient.name}
                  </p>
                </section>
                <div className="grid grid-cols-2 gap-4">
                  <section className="bg-slate-50 p-3 rounded">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">
                      Caixas
                    </label>
                    <p className="text-xl font-mono font-bold text-blue-600">
                      {selectedClient.boxes}
                    </p>
                  </section>
                  <section className="bg-slate-50 p-3 rounded">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">
                      Janela
                    </label>
                    <p className="text-xl font-mono font-bold text-slate-700">
                      {selectedClient.time}
                    </p>
                  </section>
                </div>
                <section>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Notas de Entrega
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-md p-2 text-sm text-slate-600 h-32 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Adicione instruções específicas aqui..."
                    defaultValue={selectedClient.notes || ''}
                  ></textarea>
                </section>
                <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg mt-auto hover:bg-slate-800 transition-colors">
                  Atualizar Parada
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
                <span className="text-xs font-bold text-slate-700">
                  Arrastando cliente...
                </span>
              </div>
            </div>
          )}
          {activeItem?.type === 'route' && (
            <div className="bg-slate-50 border-2 border-blue-500 p-3 rounded-lg shadow-2xl w-64 opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">
                  Arrastando rota...
                </span>
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

      {/* OPTIMIZATION MODAL */}
      <OptimizationModal
        isOpen={optimizationModalOpen}
        result={optimizationResult}
        isLoading={optimizationLoading}
        onAccept={handleAcceptOptimization}
        onCancel={handleCancelOptimization}
      />
    </DndContext>
  );
}
