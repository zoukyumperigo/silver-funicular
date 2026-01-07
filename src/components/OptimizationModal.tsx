import React from 'react';
import { X, TrendingDown, Users, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { OptimizationResult } from '../services/optimizationService';

interface OptimizationModalProps {
  isOpen: boolean;
  result: OptimizationResult | null;
  isLoading: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  result,
  isLoading,
  onAccept,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Route Optimization
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Review changes before applying
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Optimizing routes...</p>
              <p className="text-sm text-slate-400 mt-1">
                This may take a few seconds
              </p>
            </div>
          ) : result?.success ? (
            // Success State
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={16} className="text-green-600" />
                    <span className="text-xs font-bold text-green-900 uppercase">
                      Distance Saved
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {result.summary.distanceSaved.toFixed(1)} mi
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {result.summary.savingsPercent.toFixed(1)}% reduction
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-900 uppercase">
                      Routes Optimized
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {result.summary.routesOptimized}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Sequence improved
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-900 uppercase">
                      Clients Moved
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {result.summary.clientsMoved}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Better balanced
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={16} className="text-slate-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      Execution Time
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-700">
                    {(result.executionTime / 1000).toFixed(2)}s
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Fast optimization
                  </p>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  Before vs After
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                      Before
                    </p>
                    <p className="text-xl font-bold text-slate-700">
                      {result.summary.totalDistanceBefore.toFixed(1)} miles
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                      After
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {result.summary.totalDistanceAfter.toFixed(1)} miles
                    </p>
                  </div>
                </div>
              </div>

              {/* Changes List */}
              {result.changes.length > 0 ? (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">
                    Changes ({result.changes.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.changes.map((change, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {change.type === 'client_moved' ? (
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {change.type === 'client_moved' ? (
                              <>
                                <p className="font-medium text-slate-900">
                                  Moved{' '}
                                  <span className="text-purple-600">
                                    {change.clientName}
                                  </span>
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                  From {change.fromRoute} → To {change.toRoute}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-slate-900">
                                  Optimized route sequence
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                  {change.impact}
                                </p>
                              </>
                            )}
                            <p className="text-slate-400 text-xs mt-1">
                              {change.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <AlertCircle size={16} />
                    No optimization changes available. Routes are already
                    optimal or no improvements found.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Error State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <p className="text-slate-900 font-bold text-lg">
                Optimization Failed
              </p>
              <p className="text-slate-500 text-sm mt-2 text-center max-w-md">
                An error occurred while optimizing routes. Please try again or
                contact support if the issue persists.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && result?.success && (
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              <p className="font-medium">
                You can undo this optimization after applying
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Press Cmd/Ctrl+Z to revert changes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onAccept}
                disabled={result.changes.length === 0}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  result.changes.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                }`}
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}

        {!isLoading && !result?.success && (
          <div className="flex items-center justify-end p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
