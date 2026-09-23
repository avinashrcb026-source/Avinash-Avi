import React, { useState } from 'react';
import {
  Thermometer,
  Layers,
  Clock,
  Gauge,
  Activity,
  Crosshair,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Flame,
  CheckCircle2,
  Cpu,
  Wind,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { TemperatureChart } from '../components/TemperatureChart';
import { ToolpathVisualizer } from '../components/ToolpathVisualizer';

export const LiveMonitorView: React.FC = () => {
  const {
    activePrinter,
    tempHistory,
    setTargetTemp,
    setSpeedMultiplier,
    setFlowMultiplier,
    canExecuteControl,
    pauseJob,
    resumeJob,
    cancelJob,
  } = usePrinter();

  const [timeWindow, setTimeWindow] = useState<'5m' | '15m' | '1h'>('5m');
  const job = activePrinter.currentJob;
  const telemetry = activePrinter.telemetry;

  // Temperature warning checks
  const nozzleOverheat = telemetry.nozzleTemp > 250 && telemetry.nozzleTarget < 235;
  const tempInstability = Math.abs(telemetry.nozzleTemp - telemetry.nozzleTarget) > 4.5 && telemetry.nozzleTarget > 0;

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m ${sec % 60}s`;
    return `${minutes}m ${sec % 60}s`;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Machine Status Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-xl font-tech font-bold text-white">
              Dedicated Telemetry & Motion Monitor — {activePrinter.name}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Streaming real-time 12-bit ADC thermistor readings, optical encoder feedback, and motion coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {job && activePrinter.status === 'printing' && (
            <button
              onClick={pauseJob}
              disabled={!canExecuteControl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          {job && activePrinter.status === 'paused' && (
            <button
              onClick={resumeJob}
              disabled={!canExecuteControl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            Link: <strong>{activePrinter.edgeGateway.pingMs}ms</strong>
          </div>
        </div>
      </div>

      {/* Warning Alert Banner if Over-Temperature or Instability Detected */}
      {(nozzleOverheat || tempInstability) && (
        <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500 flex items-center justify-between text-xs font-mono text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-amber-300">
                {nozzleOverheat ? 'OVER-TEMPERATURE WARNING' : 'TEMPERATURE INSTABILITY WARNING'}
              </span>
              <p className="text-[11px] text-amber-200/90">
                {nozzleOverheat
                  ? `Nozzle temperature (${telemetry.nozzleTemp}°C) is exceeding setpoint tolerance!`
                  : `Hotend oscillation exceeds ±4.5°C tolerance. Check cooling fan crossdraft.`}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            PID CHECK
          </span>
        </div>
      )}

      {/* Main Grid: Temperatures Column & Motion Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Comprehensive Thermal Analysis */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-400" />
                <h3 className="font-tech font-bold text-sm text-white">Thermal Zone Controls</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <span>Auto-PID:</span>
                <span className="text-emerald-400 font-bold">LOCKED</span>
              </div>
            </div>

            {/* Thermal Readouts */}
            <div className="grid grid-cols-3 gap-3">
              {/* Hotend */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                  <span>HOTEND</span>
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="text-2xl font-tech font-bold text-rose-400">
                  {telemetry.nozzleTemp.toFixed(1)}°C
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-slate-200">{telemetry.nozzleTarget}°C</span>
                </div>
                {canExecuteControl && (
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => setTargetTemp('nozzle', 210)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      210°
                    </button>
                    <button
                      onClick={() => setTargetTemp('nozzle', 245)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      245°
                    </button>
                    <button
                      onClick={() => setTargetTemp('nozzle', 0)}
                      className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] font-mono"
                    >
                      Off
                    </button>
                  </div>
                )}
              </div>

              {/* Heated Bed */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                  <span>HEATBED</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-tech font-bold text-amber-400">
                  {telemetry.bedTemp.toFixed(1)}°C
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-slate-200">{telemetry.bedTarget}°C</span>
                </div>
                {canExecuteControl && (
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => setTargetTemp('bed', 60)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      60°
                    </button>
                    <button
                      onClick={() => setTargetTemp('bed', 80)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                    >
                      80°
                    </button>
                    <button
                      onClick={() => setTargetTemp('bed', 0)}
                      className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 text-[10px] font-mono"
                    >
                      Off
                    </button>
                  </div>
                )}
              </div>

              {/* Chamber */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                  <span>CHAMBER</span>
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-tech font-bold text-emerald-400">
                  {telemetry.chamberTemp.toFixed(1)}°C
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-slate-200">{telemetry.chamberTarget}°C</span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Fan: <strong className="text-cyan-400">{telemetry.fanSpeedPercent}%</strong>
                </div>
              </div>
            </div>

            {/* Live Chart */}
            <div className="mt-4">
              <TemperatureChart data={tempHistory} height={250} showChamber={true} />
            </div>
          </div>
        </div>

        {/* Right Column: Motion & Kinematics Monitoring */}
        <div className="space-y-4">
          {/* Toolpath 2D/3D slice viewer */}
          <ToolpathVisualizer
            currentLayer={job?.currentLayer || 1}
            totalLayers={job?.totalLayers || 100}
            xPos={telemetry.xPos}
            yPos={telemetry.yPos}
            zPos={telemetry.zPos}
            printSpeed={telemetry.printSpeedMmS}
            currentGcode={telemetry.currentGcode}
            isPrinting={activePrinter.status === 'printing'}
            filamentColor={activePrinter.activeFilament?.colorHex || '#06b6d4'}
            jobName={job?.fileName}
            progressPercent={job?.progressPercent || 0}
          />

          {/* Motion & Stepper Status Detailed Grid */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="font-tech font-bold text-sm text-white">Motion & Stepper Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">TMC2209 StealthChop Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">X POSITION</div>
                <div className="text-white font-bold text-base">{telemetry.xPos.toFixed(2)} mm</div>
                <div className="text-slate-400 text-[10px]">Limits: 0 - 250 mm</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Y POSITION</div>
                <div className="text-white font-bold text-base">{telemetry.yPos.toFixed(2)} mm</div>
                <div className="text-slate-400 text-[10px]">Limits: 0 - 210 mm</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Z HEIGHT</div>
                <div className="text-white font-bold text-base">{telemetry.zPos.toFixed(2)} mm</div>
                <div className="text-slate-400 text-[10px]">Layer: {job?.currentLayer || 1}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">EXTRUDER (E)</div>
                <div className="text-white font-bold text-base">{telemetry.ePos.toFixed(1)} mm</div>
                <div className="text-slate-400 text-[10px]">Flow: {telemetry.flowPercent}%</div>
              </div>
            </div>

            {/* Multipliers & Speed Adjustments */}
            {canExecuteControl && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Feedrate Override:</span>
                    <span className="text-cyan-400 font-bold">{telemetry.feedratePercent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[50, 80, 100, 120, 150].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setSpeedMultiplier(rate)}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                          telemetry.feedratePercent === rate
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Flowrate Override:</span>
                    <span className="text-amber-400 font-bold">{telemetry.flowPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[90, 95, 100, 105, 110].map((flow) => (
                      <button
                        key={flow}
                        onClick={() => setFlowMultiplier(flow)}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                          telemetry.flowPercent === flow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {flow}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printing Job Detailed Breakdown */}
      {job ? (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-tech font-bold text-sm text-white">Active Print Execution Metrics</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Job ID: {job.id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">CURRENT FILE</div>
              <div className="text-white font-bold truncate mt-0.5">{job.fileName}</div>
              <div className="text-[10px] text-slate-500">{job.fileSizeMb} MB</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">ELAPSED TIME</div>
              <div className="text-cyan-400 font-bold text-sm mt-0.5">{formatSeconds(job.elapsedSeconds)}</div>
              <div className="text-[10px] text-slate-500">Started: {new Date(job.startTime).toLocaleTimeString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">EST. REMAINING</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">{formatSeconds(job.remainingSeconds)}</div>
              <div className="text-[10px] text-slate-500">Total: {formatSeconds(job.totalDurationSeconds)}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">LAYER PROGRESS</div>
              <div className="text-amber-400 font-bold text-sm mt-0.5">{job.currentLayer} / {job.totalLayers}</div>
              <div className="text-[10px] text-slate-500">{job.progressPercent}% Completed</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">FILAMENT CONSUMPTION</div>
              <div className="text-white font-bold text-sm mt-0.5">{job.filamentUsedGrams}g <span className="text-slate-500 text-[10px]">/ {job.filamentTotalGrams}g</span></div>
              <div className="text-[10px] text-cyan-400">{((job.filamentUsedGrams / job.filamentTotalGrams) * 100).toFixed(0)}% Used</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">DISPATCHED OPERATOR</div>
              <div className="text-slate-300 font-semibold truncate mt-0.5">{job.operator}</div>
              <div className="text-[10px] text-emerald-400">Authenticated</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-slate-400">
          <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          No active print job currently running on {activePrinter.name}. Ready for print file assignment.
        </div>
      )}
    </div>
  );
};
