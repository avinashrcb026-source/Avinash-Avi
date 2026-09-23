import React, { useState, useMemo } from 'react';
import {
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { PrinterDevice } from '../types/printer';

interface FleetGlobalProgressBarProps {
  onNavigateToFleet?: () => void;
}

export const FleetGlobalProgressBar: React.FC<FleetGlobalProgressBarProps> = ({
  onNavigateToFleet,
}) => {
  const { printers, activePrinterId, setActivePrinterId } = usePrinter();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Identify all active jobs across the entire fleet
  const activePrinters = useMemo(() => {
    return printers.filter(
      (p) =>
        p.currentJob !== null &&
        (p.status === 'printing' || p.status === 'paused' || p.status === 'warning')
    );
  }, [printers]);

  const printingCount = useMemo(() => {
    return printers.filter((p) => p.status === 'printing').length;
  }, [printers]);

  const pausedCount = useMemo(() => {
    return printers.filter((p) => p.status === 'paused').length;
  }, [printers]);

  // Aggregate completion percentage across all active jobs
  const fleetProgressPercent = useMemo(() => {
    if (activePrinters.length === 0) return 0;
    const totalPercent = activePrinters.reduce(
      (sum, p) => sum + (p.currentJob?.progressPercent || 0),
      0
    );
    return Math.round(totalPercent / activePrinters.length);
  }, [activePrinters]);

  // Maximum remaining time among active jobs
  const maxRemainingSeconds = useMemo(() => {
    if (activePrinters.length === 0) return 0;
    return Math.max(...activePrinters.map((p) => p.currentJob?.remainingSeconds || 0));
  }, [activePrinters]);

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'warning':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'paused':
        return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      default:
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    }
  };

  const hasActiveJobs = activePrinters.length > 0;

  return (
    <div className="w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md shadow-lg transition-all select-none">
      {/* 1. Global Micro-Track Precision Bar (Continuous top edge) */}
      <div className="relative w-full h-1.5 bg-slate-900 overflow-hidden">
        {hasActiveJobs ? (
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-400 to-emerald-400 transition-all duration-700 ease-out relative"
            style={{ width: `${Math.max(2, fleetProgressPercent)}%` }}
          >
            {/* Animated leading shimmer bead */}
            {printingCount > 0 && (
              <span className="absolute right-0 top-0 bottom-0 w-8 bg-white/70 blur-xs animate-pulse"></span>
            )}
          </div>
        ) : (
          <div className="h-full w-full bg-slate-800/40"></div>
        )}
      </div>

      {/* 2. Global Fleet Progress Interactive HUD Bar */}
      <div className="px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Left: Overall Fleet Metric & Progress Label */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                printingCount > 0
                  ? 'bg-emerald-400 animate-pulse'
                  : hasActiveJobs
                  ? 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            ></span>
            <span className="font-tech font-bold text-white text-[11px] sm:text-xs tracking-wide uppercase flex items-center gap-1">
              Fleet Print Progress
            </span>
          </div>

          {/* Big Progress Badge */}
          <div className="flex items-baseline gap-1.5 bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-md">
            <span className="font-tech font-bold text-cyan-300 text-sm sm:text-base">
              {hasActiveJobs ? `${fleetProgressPercent}%` : 'STANDBY'}
            </span>
            {hasActiveJobs && (
              <span className="text-[10px] text-slate-400">
                ({activePrinters.length}/{printers.length} jobs)
              </span>
            )}
          </div>

          {/* Mini Progress Track within HUD */}
          <div className="hidden sm:block w-28 lg:w-44 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                printingCount > 0
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  : 'bg-cyan-500/70'
              }`}
              style={{ width: `${fleetProgressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Center: Machine Quick Chips (Click to focus machine) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-0.5">
          {activePrinters.map((printer) => {
            const isSelected = printer.id === activePrinterId;
            const job = printer.currentJob;
            return (
              <button
                key={printer.id}
                onClick={() => setActivePrinterId(printer.id)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-950 ring-1 ring-cyan-400/40 font-bold'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={`Click to inspect ${printer.name} (${job?.fileName})`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    printer.status === 'printing'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                ></span>
                <span className="truncate max-w-[90px]">{printer.name}</span>
                <span className="text-cyan-400 font-bold">{job?.progressPercent || 0}%</span>
              </button>
            );
          })}

          {activePrinters.length === 0 && (
            <span className="text-[10px] text-slate-500 italic">
              All machines ready for job assignment
            </span>
          )}
        </div>

        {/* Right: Estimated Max Time & Expand Details Toggle */}
        <div className="flex items-center gap-2 text-[10px]">
          {hasActiveJobs && (
            <div className="flex items-center gap-1 text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Est. Fleet Finish:</span>
              <strong className="text-emerald-400 font-bold">
                {formatRemainingTime(maxRemainingSeconds)}
              </strong>
            </div>
          )}

          {/* Toggle Details Accordion */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Fleet Progress Breakdown"
          >
            <span>{isExpanded ? 'Less' : 'Fleet Details'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Expandable Fleet Breakdown Drawer */}
      {isExpanded && (
        <div className="px-3 sm:px-4 py-3 bg-slate-900/90 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/70 text-[11px] font-mono">
              <span className="text-slate-400">
                Connected Fleet Kinematics & Active Job Queue ({printers.length} Total Machines)
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-400">● {printingCount} Extruding</span>
                <span className="text-blue-400">● {pausedCount} Paused</span>
                <span className="text-slate-500">
                  ● {printers.length - activePrinters.length} Idle
                </span>
              </div>
            </div>

            {/* Individual Machine Detailed Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {printers.map((printer) => {
                const job = printer.currentJob;
                const isSelected = printer.id === activePrinterId;

                return (
                  <div
                    key={printer.id}
                    onClick={() => setActivePrinterId(printer.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Machine Name & Status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-tech font-bold text-white text-xs truncate">
                          {printer.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${getStatusColor(
                          printer.status
                        )}`}
                      >
                        {printer.status}
                      </span>
                    </div>

                    {/* Job Details */}
                    {job ? (
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-300 font-mono truncate" title={job.fileName}>
                          {job.fileName}
                        </div>

                        {/* Progress Bar & Percentage */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                            <span>Layer {job.currentLayer}/{job.totalLayers}</span>
                            <span className="text-cyan-400 font-bold">{job.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${job.progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                          <span>Rem: {formatRemainingTime(job.remainingSeconds)}</span>
                          <span className="text-slate-300">{printer.telemetry.nozzleTemp.toFixed(0)}°C / {printer.telemetry.bedTemp.toFixed(0)}°C</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center text-[10px] text-slate-500 font-mono">
                        No active print job • Machine Idle
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
