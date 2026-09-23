import React from 'react';
import { X, Play, CheckCircle2, Flame, AlertOctagon, Activity, Eye, WifiOff, RefreshCw } from 'lucide-react';
import { usePrinter, DemoScenario } from '../context/PrinterContext';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({ isOpen, onClose }) => {
  const { activeScenario, injectScenario, isDemoMode, setIsDemoMode, activePrinter } = usePrinter();

  if (!isOpen) return null;

  const scenarios: Array<{
    id: DemoScenario;
    title: string;
    icon: any;
    severity: 'normal' | 'warning' | 'critical';
    description: string;
    expectedEffect: string;
  }> = [
    {
      id: 'normal',
      title: 'Nominal Production Printing',
      icon: CheckCircle2,
      severity: 'normal',
      description: 'Standard closed-loop PID control, stable extrusion, continuous toolhead motion.',
      expectedEffect: 'T: 210°C / 60°C, 100% feedrate, 0.18 m/s² vibration, normal camera inspection.',
    },
    {
      id: 'thermal_runaway',
      title: 'Thermal Runaway & Overheat',
      icon: Flame,
      severity: 'critical',
      description: 'Hotend heater continuous duty cycle runaway beyond configured PID tolerance band.',
      expectedEffect: 'Temperature climbs past 235°C+, triggers critical alarm and automatic safety cutoff warning.',
    },
    {
      id: 'filament_jam',
      title: 'Extruder Filament Jam / Slip',
      icon: AlertOctagon,
      severity: 'warning',
      description: 'Rotary encoder registers zero filament advance while stepper is commanded to push.',
      expectedEffect: 'Slip ratio jumps to 92%, volumetric flow drops to 0.4 mm³/s, extrusion anomaly alert.',
    },
    {
      id: 'high_vibration',
      title: 'High Toolhead Vibration / Belt Resonance',
      icon: Activity,
      severity: 'warning',
      description: 'ADXL345 accelerometer detects high resonance spikes on Y-axis motion.',
      expectedEffect: 'Vibration RMS jumps to 2.4 m/s², flags mechanical tension inspection warning.',
    },
    {
      id: 'spaghetti_failure',
      title: 'AI Computer Vision: Spaghetti Failure',
      icon: Eye,
      severity: 'critical',
      description: 'Camera AI vision module identifies loose spaghetti-like plastic detachment on build plate.',
      expectedEffect: 'Camera view displays red bounding boxes, flags print failure with 91% AI confidence.',
    },
    {
      id: 'disconnected',
      title: 'Edge Gateway Disconnect / Offline',
      icon: WifiOff,
      severity: 'critical',
      description: 'Raspberry Pi 4 / ESP32 sensor node loses WiFi/MQTT heartbeat with cloud server.',
      expectedEffect: 'Machine status switches to Offline, triggers local watchdog fail-safe alert.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                Simulated IIoT Telemetry Scenarios
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono">
                  DEMO DATA
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Inject realistic sensor telemetry & faults for machine: <strong>{activePrinter.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Scenario Grid */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isDemoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <span className="text-slate-200">
                Hardware Simulator Engine: <strong>{isDemoMode ? 'RUNNING (Dynamic Telemetry)' : 'PAUSED'}</strong>
              </span>
            </div>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs"
            >
              {isDemoMode ? 'Pause Simulator' : 'Resume Simulator'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = activeScenario === sc.id;
              const severityBorder =
                sc.severity === 'critical'
                  ? 'border-rose-500/50 hover:border-rose-500'
                  : sc.severity === 'warning'
                  ? 'border-amber-500/50 hover:border-amber-500'
                  : 'border-emerald-500/50 hover:border-emerald-500';

              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    injectScenario(sc.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/30'
                      : `bg-slate-950/60 ${severityBorder} hover:bg-slate-800/60`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          sc.severity === 'critical'
                            ? 'text-rose-400'
                            : sc.severity === 'warning'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      />
                      <span className="font-tech font-bold text-sm text-slate-100">{sc.title}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">{sc.description}</p>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-cyan-400 font-semibold">Effect: </span>
                    {sc.expectedEffect}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Demonstrates IIoT cloud detection without physical printer attached.</span>
          <button
            onClick={() => {
              injectScenario('normal');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Reset to Nominal
          </button>
        </div>
      </div>
    </div>
  );
};
