import React from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

export const MaintenanceView: React.FC = () => {
  const { maintenanceList, performMaintenance, activePrinter, canExecuteControl } = usePrinter();

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Preventive Maintenance & Component Lifespan Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active telemetry integration for {activePrinter.name} • Duty cycle hour tracking and preventive maintenance scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Next Scheduled Inspection: <strong>2026-10-01</strong>
          </span>
        </div>
      </div>

      {/* Maintenance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {maintenanceList.map((item) => {
          const isDue = item.status === 'due_soon' || item.status === 'overdue' || item.currentHours >= item.intervalHours;
          const percentUsed = Math.min(100, Math.round((item.currentHours / item.intervalHours) * 100));

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all text-xs font-mono flex flex-col justify-between ${
                isDue
                  ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-950/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-tech font-bold text-sm text-white">{item.component}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      isDue
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isDue ? 'SERVICE DUE' : 'OPTIMAL'}
                  </span>
                </div>

                <div className="my-3 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Operating Hours:</span>
                    <strong className="text-white">
                      {item.currentHours} / {item.intervalHours} hrs ({percentUsed}%)
                    </strong>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isDue ? 'bg-amber-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1 text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>Last Serviced:</span>
                    <span className="text-slate-300">{item.lastServicedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Associated Machine:</span>
                    <span className="text-cyan-300">{item.machineId || activePrinter.name}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Service Interval: {item.intervalHours}h</span>
                <button
                  onClick={() => performMaintenance(item.id)}
                  disabled={!canExecuteControl}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Log Service & Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
