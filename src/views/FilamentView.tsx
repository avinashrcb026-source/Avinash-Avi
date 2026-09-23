import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Check,
  AlertTriangle,
  Layers,
  Thermometer,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { FilamentSpool } from '../types/printer';

export const FilamentView: React.FC = () => {
  const {
    filaments,
    activePrinter,
    loadFilamentToPrinter,
    unloadFilament,
    canExecuteControl,
    activeScenario,
    injectScenario,
  } = usePrinter();

  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<'PLA' | 'PETG' | 'ABS' | 'TPU' | 'PC' | 'PA-CF'>('PLA');
  const [newBrand, setNewBrand] = useState('Polymaker');
  const [newName, setNewName] = useState('PolyLite Teal PLA');
  const [newColorHex, setNewColorHex] = useState('#06b6d4');
  const [newTotalGrams, setNewTotalGrams] = useState(1000);

  const activeSpool = activePrinter.activeFilament;
  const isRunoutAlert = activeSpool.remainingGrams < 100 || activeScenario === 'filament_jam';

  const filteredSpools = filaments.filter((f) => {
    if (filterMaterial === 'ALL') return true;
    return f.material === filterMaterial;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Filament Inventory & Rotary Optical Encoder Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Spool on {activePrinter.name} • High-precision mass tracking and encoder slip monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => injectScenario('filament_jam')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
          >
            Simulate Jam / Slip
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Spool
          </button>
        </div>
      </div>

      {/* Warning Alert if Filament Runout / Jam */}
      {isRunoutAlert && (
        <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500 text-amber-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">
                FILAMENT RUNOUT / EXTRUSION JAM WARNING
              </span>
              <p className="text-[11px] text-amber-200/90">
                Optical encoder indicates high friction or remaining spool weight has fallen below safe threshold.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            CHECK FEED PATH
          </span>
        </div>
      )}

      {/* Active Spool Hero Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl border-4 border-slate-800 shadow-inner flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: activeSpool.colorHex }}
            >
              {/* Inner spool hole graphic */}
              <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-700 shadow-md"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                  CURRENTLY LOADED
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeSpool.brand} • {activeSpool.colorName}
                </span>
              </div>
              <h2 className="text-xl font-tech font-bold text-white mt-0.5">{activeSpool.name}</h2>
              <div className="text-xs text-slate-400 font-mono">
                Assigned Machine: <strong className="text-slate-200">{activePrinter.name}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSpool.loaded ? (
              <button
                onClick={unloadFilament}
                disabled={!canExecuteControl}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                Unload Spool
              </button>
            ) : (
              <span className="text-xs font-mono text-rose-400 font-bold">No Spool Loaded</span>
            )}
          </div>
        </div>

        {/* Spool Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">REMAINING MASS</div>
            <div className="text-2xl font-tech font-bold text-white mt-0.5">
              {activeSpool.remainingGrams} <span className="text-sm font-normal text-slate-400">/ {activeSpool.totalGrams}g</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${(activeSpool.remainingGrams / activeSpool.totalGrams) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">ESTIMATED LENGTH</div>
            <div className="text-2xl font-tech font-bold text-cyan-400 mt-0.5">
              {(activeSpool.remainingMeters ?? (activeSpool.remainingGrams / 1000) * 330).toFixed(1)} <span className="text-sm font-normal text-slate-400">m</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">1.75mm ±0.02mm Tol.</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">REC. NOZZLE TEMP</div>
            <div className="text-2xl font-tech font-bold text-rose-400 mt-0.5">
              {activeSpool.nozzleTempRecommended[0]} - {activeSpool.nozzleTempRecommended[1]}°C
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Preset Ready</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">REC. BED TEMP</div>
            <div className="text-2xl font-tech font-bold text-amber-400 mt-0.5">
              {activeSpool.bedTempRecommended[0]} - {activeSpool.bedTempRecommended[1]}°C
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Textured PEI Recommended</div>
          </div>
        </div>
      </div>

      {/* Spool Inventory Catalog */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-tech font-bold text-sm text-white">Workshop Filament Spool Inventory</h3>
            <span className="text-xs font-mono text-slate-400">({filaments.length} Registered)</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-mono overflow-x-auto">
            {['ALL', 'PLA', 'PETG', 'ABS', 'TPU', 'PA-CF'].map((mat) => (
              <button
                key={mat}
                onClick={() => setFilterMaterial(mat)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterMaterial === mat
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Spools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSpools.map((spool) => {
            const isLoadedOnActive = spool.id === activeSpool.id;
            return (
              <div
                key={spool.id}
                className={`p-3.5 rounded-xl border transition-all text-xs font-mono ${
                  isLoadedOnActive
                    ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg border border-slate-700 shrink-0"
                      style={{ backgroundColor: spool.colorHex }}
                    ></div>
                    <div>
                      <div className="font-bold text-white text-sm font-tech">{spool.name}</div>
                      <div className="text-[11px] text-slate-400">{spool.brand} • {spool.colorName}</div>
                    </div>
                  </div>
                  {isLoadedOnActive ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                      LOADED
                    </span>
                  ) : (
                    <button
                      onClick={() => loadFilamentToPrinter(spool.id)}
                      disabled={!canExecuteControl}
                      className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-[10px] font-bold disabled:opacity-40"
                    >
                      Load to Machine
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining Weight:</span>
                    <span className="font-bold text-slate-200">{spool.remainingGrams}g ({((spool.remainingMeters ?? (spool.remainingGrams / 1000) * 330)).toFixed(0)}m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thermal Envelope:</span>
                    <span className="text-slate-300">
                      {spool.nozzleTempRecommended[0]}°C / {spool.bedTempRecommended[0]}°C
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register Spool Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-tech font-bold text-base text-white">Register New Filament Spool</h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Material Polymer:</label>
                <select
                  value={newMaterial}
                  onChange={(e: any) => setNewMaterial(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="PLA">PLA (Polylactic Acid)</option>
                  <option value="PETG">PETG (Polyethylene Terephthalate Glycol)</option>
                  <option value="ABS">ABS (Acrylonitrile Butadiene Styrene)</option>
                  <option value="TPU">TPU (Thermoplastic Polyurethane 95A)</option>
                  <option value="PA-CF">PA-CF (Carbon Fiber Reinforced Nylon)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Brand Manufacturer:</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  placeholder="e.g. Prusament, Polymaker, eSun"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Spool Name & Designation:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  placeholder="e.g. PolyLite Teal PLA"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Color Palette:</label>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-full h-9 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Initial Weight (g):</label>
                  <input
                    type="number"
                    value={newTotalGrams}
                    onChange={(e) => setNewTotalGrams(parseInt(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
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
                Save Spool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
