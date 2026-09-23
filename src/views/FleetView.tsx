import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Thermometer,
  Gauge,
  Clock,
  Play,
  Pause,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { PrinterDevice, PrinterStatus } from '../types/printer';

interface FleetViewProps {
  onNavigate: (tab: string) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({ onNavigate }) => {
  const { printers, activePrinterId, setActivePrinterId } = usePrinter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Printer Form State
  const [newName, setNewName] = useState('PRUSA-MK4-CELL03');
  const [newModel, setNewModel] = useState('Prusa MK4 Nextruder');
  const [newFirmware, setNewFirmware] = useState('PrusaBuddy 5.1.2');
  const [newGateway, setNewGateway] = useState<'esp32' | 'raspberry_pi_4' | 'octoprint'>('raspberry_pi_4');

  const filteredPrinters = printers.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'printing':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'error':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'paused':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'offline':
        return 'bg-slate-700/40 text-slate-400 border-slate-600';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Industrial IIoT Fleet Fleet Workcells
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Distributed workshop manufacturing cells • Real-time load-balancing and remote orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Machine
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search machine name, model, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {['all', 'printing', 'idle', 'paused', 'warning', 'offline'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-0.5 rounded capitalize ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrinters.map((printer) => {
          const isSelected = printer.id === activePrinterId;
          const job = printer.currentJob;
          const telemetry = printer.telemetry;

          return (
            <div
              key={printer.id}
              onClick={() => setActivePrinterId(printer.id)}
              className={`p-5 rounded-2xl border transition-all text-xs font-mono cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/30 shadow-xl'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-tech font-bold text-base text-white">{printer.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40 font-bold">
                          ACTIVE CONSOLE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{printer.model} • {printer.location}</div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusBadge(
                      printer.status
                    )}`}
                  >
                    ● {printer.status}
                  </span>
                </div>

                {/* Job & Progress or Idle Info */}
                {job ? (
                  <div className="my-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span className="truncate max-w-[200px] font-bold text-white">{job.fileName}</span>
                      <span className="text-cyan-400 font-bold">{job.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all"
                        style={{ width: `${job.progressPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Layer {job.currentLayer} / {job.totalLayers}</span>
                      <span>Rem: {formatSeconds(job.remainingSeconds)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="my-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-slate-500">
                    Machine Standby • No active print job queued
                  </div>
                )}

                {/* Live Thermal Readings */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">NOZZLE</div>
                    <div className="font-bold text-rose-400 mt-0.5">
                      {telemetry.nozzleTemp.toFixed(1)}°C
                    </div>
                    <div className="text-[9px] text-slate-500">/ {telemetry.nozzleTarget}°C</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">BED</div>
                    <div className="font-bold text-amber-400 mt-0.5">
                      {telemetry.bedTemp.toFixed(1)}°C
                    </div>
                    <div className="text-[9px] text-slate-500">/ {telemetry.bedTarget}°C</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">VIBRATION</div>
                    <div className="font-bold text-cyan-400 mt-0.5">
                      {telemetry.vibrationRms} m/s²
                    </div>
                    <div className="text-[9px] text-slate-500">{telemetry.powerWatts}W</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Gateway: {printer.edgeGateway.type} ({printer.edgeGateway.pingMs}ms)
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePrinterId(printer.id);
                    onNavigate('dashboard');
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                >
                  Open Dashboard Console →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-tech font-bold text-base text-white">Register New Industrial Workcell</h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Machine Identifier Name:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hardware Model:</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Firmware Architecture:</label>
                <input
                  type="text"
                  value={newFirmware}
                  onChange={(e) => setNewFirmware(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Edge Gateway Device:</label>
                <select
                  value={newGateway}
                  onChange={(e: any) => setNewGateway(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="raspberry_pi_4">Raspberry Pi 4B (Klipper Linux Host)</option>
                  <option value="esp32">ESP32-WROOM-32 (Direct Sensor Hub)</option>
                  <option value="octoprint">OctoPrint Server Bridge</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold"
              >
                Provision & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
