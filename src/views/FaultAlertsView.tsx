import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Filter,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { usePrinter, DemoScenario } from '../context/PrinterContext';

export const FaultAlertsView: React.FC = () => {
  const {
    faults,
    activeFaultsCount,
    resolveFault,
    acknowledgeFault,
    injectScenario,
    activePrinter,
  } = usePrinter();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaults = faults.filter((f) => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.faultCode.toLowerCase().includes(q) ||
        f.faultType.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-tech font-bold text-white">
              Fault Detection, Machine Alarms & Interlocks
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time physical anomaly classification • Machine interlock safety triggers and root-cause resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
            {activeFaultsCount} Active Anomaly{activeFaultsCount === 1 ? '' : 'ies'}
          </span>
        </div>
      </div>

      {/* Fault Scenario Quick Injector Ribbon (For Review & Testing) */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-400">Trigger Fault Scenario Simulation:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => injectScenario('thermal_runaway')}
            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-semibold"
          >
            Thermal Runaway (Hotend)
          </button>
          <button
            onClick={() => injectScenario('filament_jam')}
            className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 font-semibold"
          >
            Filament Jam (Encoder Slip)
          </button>
          <button
            onClick={() => injectScenario('high_vibration')}
            className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 font-semibold"
          >
            Vibration Spike (ADXL345)
          </button>
          <button
            onClick={() => injectScenario('spaghetti_failure')}
            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-semibold"
          >
            Spaghetti Detachment (CV)
          </button>
          <button
            onClick={() => injectScenario('normal')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Clear / Nominal
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, type, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 px-1">Severity:</span>
            {(['all', 'critical', 'warning'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded capitalize ${
                  filterSeverity === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 px-1">Status:</span>
            {(['all', 'active', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded capitalize ${
                  filterStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fault Events List Cards */}
      <div className="space-y-3">
        {filteredFaults.length === 0 ? (
          <div className="p-12 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No fault conditions match current filter. Machine interlocks nominal.
          </div>
        ) : (
          filteredFaults.map((f) => {
            const isResolved = f.status === 'resolved';
            const isCritical = f.severity === 'critical';

            return (
              <div
                key={f.id}
                className={`p-4 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : isCritical
                    ? 'bg-slate-950 border-rose-500/80 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-950/30'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {f.faultCode}
                    </span>
                    <h3 className="font-tech font-bold text-base text-white">{f.faultType}</h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500">
                      {new Date(f.timestamp).toLocaleDateString()} {new Date(f.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : f.status === 'investigating'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      Physical Observation
                    </div>
                    <p className="text-slate-300 leading-relaxed">{f.description}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-amber-400 uppercase font-semibold mb-1">
                      Identified Probable Cause
                    </div>
                    <p className="text-slate-300 leading-relaxed">{f.possibleCause}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-cyan-400 uppercase font-semibold mb-1">
                      Recommended Engineering SOP
                    </div>
                    <p className="text-slate-300 leading-relaxed">{f.recommendedAction}</p>
                  </div>
                </div>

                {/* Resolution & Machine Footer Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="text-slate-400">
                    Target Machine: <strong className="text-slate-200">{f.machineName} ({f.machineId})</strong>
                    {isResolved && f.resolvedBy && (
                      <span className="text-emerald-400 ml-2">
                        ✓ Resolved by {f.resolvedBy}
                      </span>
                    )}
                  </div>

                  {!isResolved && (
                    <div className="flex items-center gap-2">
                      {f.status === 'active' && (
                        <button
                          onClick={() => acknowledgeFault(f.id)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveFault(f.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Cleared & Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
