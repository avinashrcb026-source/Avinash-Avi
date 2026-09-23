import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  Square,
  Power,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  Thermometer,
  Wind,
  Shield,
  Layers,
  Check,
  AlertOctagon,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

interface RemoteControlViewProps {
  onOpenEstop: () => void;
}

export const RemoteControlView: React.FC<RemoteControlViewProps> = ({ onOpenEstop }) => {
  const {
    activePrinter,
    canExecuteControl,
    currentUser,
    startJob,
    pauseJob,
    resumeJob,
    cancelJob,
    setTargetTemp,
    setSpeedMultiplier,
    setFlowMultiplier,
    jogAxis,
    homeAxis,
    preheatPreset,
    files,
  } = usePrinter();

  const [jogStepMm, setJogStepMm] = useState<number>(10);
  const [customNozzle, setCustomNozzle] = useState<string>('210');
  const [customBed, setCustomBed] = useState<string>('60');

  const telemetry = activePrinter.telemetry;
  const isPrinting = activePrinter.status === 'printing';
  const isPaused = activePrinter.status === 'paused';

  return (
    <div className="space-y-4">
      {/* Top Header & Permission Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Secure Remote Machine Control — {activePrinter.name}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically authenticated command bridge with local hardware watchdog overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Authorization:</span>
            <span className="font-bold text-cyan-300 uppercase">{currentUser.role}</span>
          </div>

          <button
            onClick={onOpenEstop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-xs shadow-md shadow-rose-600/30"
          >
            <Power className="w-3.5 h-3.5" />
            ESTOP
          </button>
        </div>
      </div>

      {/* RBAC Permission Warning if Viewer */}
      {!canExecuteControl && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/80 text-amber-200 text-xs font-mono flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Read-Only Mode Active:</strong> Your current persona ({currentUser.role.toUpperCase()}) does not possess machine control execution privileges. Switch role to Admin, Engineer, or Operator in the Profile menu to dispatch commands.
          </div>
        </div>
      )}

      {/* Main Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Job Execution & Temperature Setpoints */}
        <div className="space-y-4">
          {/* Print Job Primary Controls */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-tech font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              Print Job Execution
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {isPrinting ? (
                <button
                  onClick={pauseJob}
                  disabled={!canExecuteControl}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                  Pause Print
                </button>
              ) : isPaused ? (
                <button
                  onClick={resumeJob}
                  disabled={!canExecuteControl}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Resume Print
                </button>
              ) : (
                <button
                  onClick={() => startJob()}
                  disabled={!canExecuteControl}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Start Job
                </button>
              )}

              <button
                onClick={cancelJob}
                disabled={!canExecuteControl || (!isPrinting && !isPaused)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/50 text-slate-400 border border-slate-700 font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Square className="w-4 h-4" />
                Cancel Job
              </button>
            </div>
          </div>

          {/* Quick Preheat Profiles */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-tech font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Thermal Preheat Presets
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => preheatPreset('PLA')}
                disabled={!canExecuteControl}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left transition-colors disabled:opacity-50"
              >
                <div className="font-bold text-white">PLA Profile</div>
                <div className="text-[10px] text-slate-400 mt-0.5">215°C / 60°C</div>
              </button>

              <button
                onClick={() => preheatPreset('PETG')}
                disabled={!canExecuteControl}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left transition-colors disabled:opacity-50"
              >
                <div className="font-bold text-white">PETG Profile</div>
                <div className="text-[10px] text-slate-400 mt-0.5">240°C / 80°C</div>
              </button>

              <button
                onClick={() => preheatPreset('ABS')}
                disabled={!canExecuteControl}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left transition-colors disabled:opacity-50"
              >
                <div className="font-bold text-white">ABS Profile</div>
                <div className="text-[10px] text-slate-400 mt-0.5">255°C / 105°C</div>
              </button>

              <button
                onClick={() => preheatPreset('COOLDOWN')}
                disabled={!canExecuteControl}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left transition-colors disabled:opacity-50"
              >
                <div className="font-bold text-rose-300">Cooldown</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Heaters 0°C</div>
              </button>
            </div>

            {/* Custom Temp Inputs */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-16 text-slate-400">Nozzle:</span>
                <input
                  type="number"
                  value={customNozzle}
                  onChange={(e) => setCustomNozzle(e.target.value)}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                  placeholder="210"
                />
                <span className="text-slate-500">°C</span>
                <button
                  onClick={() => setTargetTemp('nozzle', parseFloat(customNozzle) || 0)}
                  disabled={!canExecuteControl}
                  className="ml-auto px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] disabled:opacity-50"
                >
                  Set
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 text-slate-400">Bed:</span>
                <input
                  type="number"
                  value={customBed}
                  onChange={(e) => setCustomBed(e.target.value)}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                  placeholder="60"
                />
                <span className="text-slate-500">°C</span>
                <button
                  onClick={() => setTargetTemp('bed', parseFloat(customBed) || 0)}
                  disabled={!canExecuteControl}
                  className="ml-auto px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Manual Axis Jogging & Kinematics */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-tech font-bold text-sm text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Axis Jogging & Motion Control
              </h3>
              {/* Step distance buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                {[0.1, 1, 10, 50].map((step) => (
                  <button
                    key={step}
                    onClick={() => setJogStepMm(step)}
                    className={`px-2 py-0.5 rounded ${
                      jogStepMm === step ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {step}mm
                  </button>
                ))}
              </div>
            </div>

            {/* D-Pad Jog Controls */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800 my-2">
              <button
                onClick={() => jogAxis('Y', jogStepMm)}
                disabled={!canExecuteControl || isPrinting}
                className="w-14 h-12 rounded-lg bg-slate-800 hover:bg-cyan-600/40 text-slate-200 border border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-bold transition-all disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4" />
                +Y
              </button>

              <div className="flex items-center gap-4 my-2">
                <button
                  onClick={() => jogAxis('X', -jogStepMm)}
                  disabled={!canExecuteControl || isPrinting}
                  className="w-14 h-12 rounded-lg bg-slate-800 hover:bg-cyan-600/40 text-slate-200 border border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-bold transition-all disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  -X
                </button>

                <button
                  onClick={() => homeAxis('ALL')}
                  disabled={!canExecuteControl || isPrinting}
                  className="w-16 h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs flex flex-col items-center justify-center shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40"
                >
                  HOME
                  <span className="text-[9px] font-mono opacity-80">ALL</span>
                </button>

                <button
                  onClick={() => jogAxis('X', jogStepMm)}
                  disabled={!canExecuteControl || isPrinting}
                  className="w-14 h-12 rounded-lg bg-slate-800 hover:bg-cyan-600/40 text-slate-200 border border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-bold transition-all disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                  +X
                </button>
              </div>

              <button
                onClick={() => jogAxis('Y', -jogStepMm)}
                disabled={!canExecuteControl || isPrinting}
                className="w-14 h-12 rounded-lg bg-slate-800 hover:bg-cyan-600/40 text-slate-200 border border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-bold transition-all disabled:opacity-40"
              >
                <ArrowDown className="w-4 h-4" />
                -Y
              </button>
            </div>

            {/* Z-Axis & Individual Homing */}
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                <span className="text-slate-400 font-bold">Z ELEVATION</span>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => jogAxis('Z', jogStepMm)}
                    disabled={!canExecuteControl || isPrinting}
                    className="flex-1 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-40"
                  >
                    +Z ({jogStepMm}mm)
                  </button>
                  <button
                    onClick={() => jogAxis('Z', -jogStepMm)}
                    disabled={!canExecuteControl || isPrinting}
                    className="flex-1 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-40"
                  >
                    -Z ({jogStepMm}mm)
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                <span className="text-slate-400 font-bold">INDIVIDUAL HOME</span>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => homeAxis('X')}
                    disabled={!canExecuteControl || isPrinting}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold disabled:opacity-40"
                  >
                    Home X
                  </button>
                  <button
                    onClick={() => homeAxis('Y')}
                    disabled={!canExecuteControl || isPrinting}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold disabled:opacity-40"
                  >
                    Home Y
                  </button>
                  <button
                    onClick={() => homeAxis('Z')}
                    disabled={!canExecuteControl || isPrinting}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold disabled:opacity-40"
                  >
                    Home Z
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Extruder & Dynamic Multipliers */}
        <div className="space-y-4">
          {/* Extruder Feed Controls */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-tech font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              Extruder Manual Feeder
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Extruder Minimum Temp Guard:</span>
                <span className={telemetry.nozzleTemp >= 170 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {telemetry.nozzleTemp >= 170 ? 'Ready (>=170°C)' : 'Locked (<170°C Cold)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => jogAxis('E', 5)}
                  disabled={!canExecuteControl || telemetry.nozzleTemp < 170}
                  className="py-2 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 font-bold disabled:opacity-40"
                >
                  Extrude 5mm
                </button>
                <button
                  onClick={() => jogAxis('E', 15)}
                  disabled={!canExecuteControl || telemetry.nozzleTemp < 170}
                  className="py-2 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 font-bold disabled:opacity-40"
                >
                  Extrude 15mm
                </button>
                <button
                  onClick={() => jogAxis('E', -5)}
                  disabled={!canExecuteControl || telemetry.nozzleTemp < 170}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold disabled:opacity-40"
                >
                  Retract 5mm
                </button>
                <button
                  onClick={() => jogAxis('E', -15)}
                  disabled={!canExecuteControl || telemetry.nozzleTemp < 170}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold disabled:opacity-40"
                >
                  Retract 15mm
                </button>
              </div>
            </div>
          </div>

          {/* Machine Live Multipliers */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-4">
            <h3 className="font-tech font-bold text-sm text-white">Dynamic Flow & Speed Multipliers</h3>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Feedrate Speed Multiplier:</span>
                <span className="font-bold text-cyan-400">{telemetry.feedratePercent}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={telemetry.feedratePercent}
                onChange={(e) => setSpeedMultiplier(parseInt(e.target.value))}
                disabled={!canExecuteControl}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Volumetric Extrusion Multiplier:</span>
                <span className="font-bold text-amber-400">{telemetry.flowPercent}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="125"
                value={telemetry.flowPercent}
                onChange={(e) => setFlowMultiplier(parseInt(e.target.value))}
                disabled={!canExecuteControl}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
