import React from 'react';
import {
  Activity,
  Flame,
  Layers,
  Clock,
  Gauge,
  Wifi,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Thermometer,
  Wrench,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { TemperatureChart } from '../components/TemperatureChart';
import { ToolpathVisualizer } from '../components/ToolpathVisualizer';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenEstop: () => void;
  onOpenScenarioModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenEstop,
  onOpenScenarioModal,
}) => {
  const {
    activePrinter,
    printers,
    setActivePrinterId,
    tempHistory,
    faults,
    pauseJob,
    resumeJob,
    cancelJob,
    preheatPreset,
    isDemoMode,
    activeScenario,
    canExecuteControl,
    runAiDiagnostics,
    isAiDiagnosing,
    aiReport,
  } = usePrinter();

  const activeJob = activePrinter.currentJob;
  const telemetry = activePrinter.telemetry;

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${sec % 60}s`;
  };

  const activeFaults = faults.filter((f) => f.machineId === activePrinter.id && f.status === 'active');

  return (
    <div className="space-y-4">
      {/* Top Warning Banner if Active Faults Exist */}
      {activeFaults.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/80 flex items-center justify-between shadow-lg shadow-rose-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-rose-300 uppercase">
                Active Machine Anomaly: {activeFaults[0].faultType}
              </div>
              <div className="text-xs text-rose-200/90 font-mono">
                {activeFaults[0].description}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('faults')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-xs shadow transition-colors flex items-center gap-1"
          >
            Investigate & Clear
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Live Printer Status Section (Requested in Prompt Section 2) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                PRIMARY WORKCELL
              </span>
              <span className="text-xs font-mono text-slate-400">
                {activePrinter.model}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-tech font-bold text-white tracking-wide flex items-center gap-3">
              {activePrinter.name}
              <span
                className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  activePrinter.status === 'printing'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : activePrinter.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : activePrinter.status === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                ● {activePrinter.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Location: <strong>{activePrinter.location}</strong> | Edge: {activePrinter.edgeGateway.type} ({activePrinter.edgeGateway.ip} • ping: {activePrinter.edgeGateway.pingMs}ms)
            </p>
          </div>

          {/* Quick Machine Control Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {activePrinter.status === 'printing' ? (
              <button
                onClick={pauseJob}
                disabled={!canExecuteControl}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition-all disabled:opacity-50"
              >
                <Pause className="w-4 h-4" />
                Pause Job
              </button>
            ) : activePrinter.status === 'paused' ? (
              <button
                onClick={resumeJob}
                disabled={!canExecuteControl}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Resume Job
              </button>
            ) : (
              <button
                onClick={() => onNavigate('files')}
                disabled={!canExecuteControl}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech text-xs font-bold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Select File & Print
              </button>
            )}

            {activeJob && (
              <button
                onClick={cancelJob}
                disabled={!canExecuteControl}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 border border-slate-700 text-slate-300 font-mono text-xs transition-all disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 text-rose-400" />
                Stop Job
              </button>
            )}

            <button
              onClick={() => onNavigate('control')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold transition-all"
            >
              Control Panel
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Status Key Metrics (Big Cards Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {/* Progress Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
            {activePrinter.status === 'printing' && (
              <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl pointer-events-none animate-pulse"></div>
            )}
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>PROGRESS</span>
              <div className="flex items-center gap-1">
                {activePrinter.status === 'printing' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <div className="text-2xl font-tech font-bold text-white flex items-baseline gap-1.5">
              {activeJob ? `${activeJob.progressPercent}%` : 'IDLE'}
              {activePrinter.status === 'printing' && (
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold animate-pulse">
                  Extruding
                </span>
              )}
            </div>
            {/* Animated Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activePrinter.status === 'printing'
                    ? 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${activeJob ? activeJob.progressPercent : 0}%` }}
              >
                {activePrinter.status === 'printing' && (
                  <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_1.5s_infinite]"></div>
                )}
              </div>
            </div>
          </div>

          {/* Nozzle Temp Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>NOZZLE TEMP</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-tech font-bold text-rose-400">
              {telemetry.nozzleTemp.toFixed(1)}°C
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{telemetry.nozzleTarget}°C</strong>
            </div>
          </div>

          {/* Heated Bed Temp Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>BED TEMP</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-tech font-bold text-amber-400">
              {telemetry.bedTemp.toFixed(1)}°C
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{telemetry.bedTarget}°C</strong>
            </div>
          </div>

          {/* Layer Info Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>LAYER</span>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-tech font-bold text-blue-400">
              {activeJob ? `${activeJob.currentLayer} / ${activeJob.totalLayers}` : '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Z: <strong className="text-slate-200">{telemetry.zPos.toFixed(2)} mm</strong>
            </div>
          </div>

          {/* Remaining Time Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>REMAINING</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-tech font-bold text-emerald-400">
              {activeJob ? formatSeconds(activeJob.remainingSeconds) : '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Elapsed: <strong className="text-slate-200">{activeJob ? formatSeconds(activeJob.elapsedSeconds) : '0m'}</strong>
            </div>
          </div>

          {/* Active Filament Spool Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>FILAMENT</span>
              <div
                className="w-3 h-3 rounded-full border border-slate-600"
                style={{ backgroundColor: activePrinter.activeFilament.colorHex }}
              ></div>
            </div>
            <div className="text-base font-tech font-bold text-white truncate">
              {activePrinter.activeFilament.material}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              {activePrinter.activeFilament.remainingGrams}g remaining
            </div>
          </div>
        </div>

        {/* Secondary Detail Bar: Print Speed, G-code, Edge Gateway, Maintenance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-400">
          <div>
            Print File: <strong className="text-slate-200">{activeJob?.fileName || 'No active job'}</strong>
          </div>
          <div>
            Kinematic Speed: <strong className="text-cyan-400">{telemetry.printSpeedMmS} mm/s ({telemetry.feedratePercent}%)</strong>
          </div>
          <div>
            Connectivity: <strong className="text-emerald-400">MQTT Secure (14ms)</strong>
          </div>
          <div>
            Last Service: <strong className="text-slate-300">{activePrinter.lastMaintenanceDate}</strong>
          </div>
        </div>
      </div>

      {/* Main Two-Column Row: Live Telemetry Graph & 2D Toolpath Slice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-Time Temperature History Graph */}
        <div className="flex flex-col">
          <TemperatureChart data={tempHistory} height={230} showChamber={true} />
        </div>

        {/* Toolhead Kinematic Path & Layer Visualizer */}
        <div className="flex flex-col">
          <ToolpathVisualizer
            currentLayer={activeJob?.currentLayer || 1}
            totalLayers={activeJob?.totalLayers || 100}
            xPos={telemetry.xPos}
            yPos={telemetry.yPos}
            zPos={telemetry.zPos}
            printSpeed={telemetry.printSpeedMmS}
            currentGcode={telemetry.currentGcode}
            isPrinting={activePrinter.status === 'printing'}
            filamentColor={activePrinter.activeFilament?.colorHex || '#06b6d4'}
            jobName={activeJob?.fileName}
            progressPercent={activeJob?.progressPercent || 0}
          />
        </div>
      </div>

      {/* Industrial Sensor Telemetry & AI Diagnostic Advisory Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sensor Quick Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-tech font-bold text-sm text-white">Live Physical Sensors</h3>
            </div>
            <button
              onClick={() => onNavigate('sensors')}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              All Sensors →
            </button>
          </div>

          <div className="space-y-2 mt-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Toolhead Accelerometer (ADXL345):</span>
              <span className="font-bold text-slate-200">{telemetry.vibrationRms} m/s² RMS</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">INA219 Power Consumption:</span>
              <span className="font-bold text-amber-400">{telemetry.powerWatts} W ({telemetry.currentA}A)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Volumetric Extrusion Rate:</span>
              <span className="font-bold text-cyan-400">{telemetry.extrusionVolumetricMm3S} mm³/s</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Chamber Ambient (BME280):</span>
              <span className="font-bold text-emerald-400">{telemetry.chamberTemp}°C (38% RH)</span>
            </div>
          </div>
        </div>

        {/* AI Assisted Fault Detection Widget (Prompt Section 6) */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-tech font-bold text-sm text-white">AI Real-Time Anomaly Engine</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Gemini-3.8-Flash
              </span>
            </div>
            <button
              onClick={runAiDiagnostics}
              disabled={isAiDiagnosing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {isAiDiagnosing ? 'Analyzing Telemetry...' : 'Run AI Diagnostic Scan'}
            </button>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300">
            {aiReport ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-cyan-300 font-tech text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {aiReport.headline}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px]">
                    Health Score: {aiReport.overallHealthScore}/100
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{aiReport.telemetryAnalysis}</p>
                <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800 flex items-center justify-between">
                  <span>Note: AI findings are presented as detections & advisories for engineering validation.</span>
                  <button
                    onClick={() => onNavigate('ai-insights')}
                    className="text-cyan-400 hover:underline"
                  >
                    View Full AI Audit →
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-2 text-slate-400 flex items-center justify-between">
                <span>
                  Telemetry analysis standby. No thermal hysteresis or extrusion anomalies currently flag safety thresholds.
                </span>
                <button
                  onClick={runAiDiagnostics}
                  className="text-cyan-400 hover:underline ml-2"
                >
                  Run Scan Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connected Fleet Quick Switcher Cards */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-tech font-bold text-sm text-white">Factory Fleet Overview</h3>
            <span className="text-xs font-mono text-slate-400">({printers.length} Machines Connected)</span>
          </div>
          <button
            onClick={() => onNavigate('fleet')}
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            Manage Fleet →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {printers.map((p) => {
            const isSelected = p.id === activePrinter.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePrinterId(p.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-tech font-bold text-sm text-white">{p.name}</span>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                      p.status === 'printing'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : p.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mb-2">{p.model}</div>
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>T: {p.telemetry.nozzleTemp.toFixed(1)}°C</span>
                  <span>B: {p.telemetry.bedTemp.toFixed(1)}°C</span>
                  <span>{p.currentJob ? `${p.currentJob.progressPercent}%` : 'Idle'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
