import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Settings,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { SensorItem } from '../types/printer';

export const SensorManagementView: React.FC = () => {
  const { sensors, updateSensorCalibration, activePrinter, canExecuteControl } = usePrinter();
  const [selectedSensor, setSelectedSensor] = useState<SensorItem | null>(null);
  const [calibrationNote, setCalibrationNote] = useState('');

  const getConditionBadge = (cond: string) => {
    switch (cond) {
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'error':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const handleCalibrate = (sensor: SensorItem) => {
    setSelectedSensor(sensor);
    setCalibrationNote(`Zero-baseline calibrated with 2-point compensation algorithm.`);
  };

  const submitCalibration = () => {
    if (!selectedSensor) return;
    updateSensorCalibration(selectedSensor.id, calibrationNote);
    setSelectedSensor(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Industrial Physical Sensors & Bus Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active bus diagnostics: SPI, I2C, 12-Bit ADC, GPIO interrupts connected to ESP32 / Pi4 Gateway.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            {sensors.length} Monitored Endpoints
          </span>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sensors.map((sensor) => {
          return (
            <div
              key={sensor.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                      {sensor.type.replace('_', ' ')}
                    </span>
                    <h3 className="font-tech font-bold text-sm text-white">{sensor.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getConditionBadge(
                      sensor.condition
                    )}`}
                  >
                    {sensor.condition}
                  </span>
                </div>

                <div className="my-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-500 uppercase">Live Bus Telemetry</div>
                  <div className="text-xl font-bold text-white mt-0.5">{sensor.reading}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{sensor.rawDetail}</div>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>Pin / Bus Interface:</span>
                    <strong className="text-slate-300">{sensor.hardwareBus}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Host / Gateway Node:</span>
                    <span className="text-slate-300">{sensor.hostDevice}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Sampling: 100 Hz</span>
                <button
                  onClick={() => handleCalibrate(sensor)}
                  disabled={!canExecuteControl}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Calibrate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Calibration Modal */}
      {selectedSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Sensor Calibration — {selectedSensor.name}
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <div>Current Reading: <strong className="text-cyan-400">{selectedSensor.reading}</strong></div>
                <div>Bus Interface: <strong className="text-slate-200">{selectedSensor.hardwareBus}</strong></div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Calibration Compensation Notes / Zero Offset:</label>
                <textarea
                  rows={3}
                  value={calibrationNote}
                  onChange={(e) => setCalibrationNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-cyan-400"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedSensor(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={submitCalibration}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold"
              >
                Store Calibration to EEPROM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
