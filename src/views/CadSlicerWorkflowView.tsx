import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
  CheckCircle2,
  Play,
  ArrowRight,
  FileCode,
  Sparkles,
  Zap,
  Clock,
  Compass,
  HardDrive,
  Database,
  FolderOpen,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

interface CadSlicerWorkflowViewProps {
  onNavigate: (tab: string) => void;
  onOpenUsbSsdModal?: () => void;
  onOpenCadDataModal?: () => void;
  preselectedModel?: string | null;
}

export const CadSlicerWorkflowView: React.FC<CadSlicerWorkflowViewProps> = ({
  onNavigate,
  onOpenUsbSsdModal,
  onOpenCadDataModal,
  preselectedModel,
}) => {
  const { activePrinter, startJob, uploadPrintFile } = usePrinter();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);
  const [selectedModel, setSelectedModel] = useState('Turbine_Impeller_V2.step');
  const [layerHeight, setLayerHeight] = useState('0.20');
  const [infillDensity, setInfillDensity] = useState('20');
  const [infillPattern, setInfillPattern] = useState('Gyroid');
  const [printSpeed, setPrintSpeed] = useState('80');
  const [supportsEnabled, setSupportsEnabled] = useState(true);
  const [material, setMaterial] = useState('PLA');

  useEffect(() => {
    if (preselectedModel) {
      setSelectedModel(preselectedModel);
      setActiveStep(2);
    }
  }, [preselectedModel]);

  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceResult, setSliceResult] = useState<{
    estimatedSeconds: number;
    layerCount: number;
    filamentGrams: number;
    filamentMeters: number;
  } | null>({
    estimatedSeconds: 8400,
    layerCount: 240,
    filamentGrams: 58.2,
    filamentMeters: 19.5,
  });

  const handleRunSlicer = async () => {
    setIsSlicing(true);
    try {
      const res = await fetch('/api/slicer/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layerHeightMm: parseFloat(layerHeight),
          infillPercent: parseInt(infillDensity),
          printSpeedMmS: parseInt(printSpeed),
          supportEnabled: supportsEnabled,
          material,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSliceResult(data);
        setActiveStep(3);
      }
    } catch {
      // Fallback
    } finally {
      setIsSlicing(false);
    }
  };

  const handleDispatchPrint = () => {
    if (!sliceResult) return;
    const fileName = `${selectedModel.replace('.step', '')}_L${layerHeight}_I${infillDensity}.gcode`;
    uploadPrintFile({
      fileName,
      fileSizeBytes: 18500000,
      layerCount: sliceResult.layerCount,
      estimatedSeconds: sliceResult.estimatedSeconds,
      filamentGrams: sliceResult.filamentGrams,
      filamentMeters: sliceResult.filamentMeters,
      material: material as any,
      slicer: 'PrusaSlicer 2.7.2',
      version: '1.0',
      description: 'Sliced via Cloud Slicer Engine',
      assignedPrinterId: activePrinter.id,
      printCount: 0,
    });
    startJob();
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Integrated Cloud CAD → Slicer → Print Pipeline
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cloud G-code toolpath slicing engine with automatic kinematics constraints and material compensation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <button
            onClick={() => onOpenUsbSsdModal?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/50 font-tech font-bold transition-all shadow-sm active:scale-95"
            title="Import CAD models directly from physical USB & NVMe SSD drives"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>USB / SSD CAD Access</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>

          <button
            onClick={() => onOpenCadDataModal?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 font-tech font-bold transition-all shadow-sm active:scale-95"
            title="Browse central CAD engineering model library"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAD Data Access</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-800">
            <span>Target:</span>
            <strong className="text-cyan-400">{activePrinter.name}</strong>
          </div>
        </div>
      </div>

      {/* 4-Step Interactive Workflow Pipeline Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 1
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase">Step 01</div>
          <div className="font-tech font-bold text-sm text-white mt-0.5">CAD Model Input</div>
          <div className="text-[11px] truncate text-slate-400 mt-1">{selectedModel}</div>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 2
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase">Step 02</div>
          <div className="font-tech font-bold text-sm text-white mt-0.5">Slicer Parameters</div>
          <div className="text-[11px] text-slate-400 mt-1">{layerHeight}mm • {infillDensity}% {infillPattern}</div>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 3
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase">Step 03</div>
          <div className="font-tech font-bold text-sm text-white mt-0.5">Toolpath Verification</div>
          <div className="text-[11px] text-slate-400 mt-1">{sliceResult?.layerCount || 0} Layers • {sliceResult?.filamentGrams || 0}g</div>
        </button>

        <button
          onClick={() => setActiveStep(4)}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStep === 4
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase">Step 04</div>
          <div className="font-tech font-bold text-sm text-white mt-0.5">Print Dispatch</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for {activePrinter.name}</div>
        </button>
      </div>

      {/* Main Workflow Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Slicer Settings Sidebar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-tech font-bold text-sm text-white">Slicing Configurations</h3>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Layer Height (Resolution):</label>
            <select
              value={layerHeight}
              onChange={(e) => setLayerHeight(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            >
              <option value="0.12">0.12 mm (Ultra Detail)</option>
              <option value="0.16">0.16 mm (Optimal Mechanical)</option>
              <option value="0.20">0.20 mm (Standard Production)</option>
              <option value="0.28">0.28 mm (Rapid Prototyping)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Infill Density ({infillDensity}%):</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={infillDensity}
              onChange={(e) => setInfillDensity(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Infill Internal Geometry:</label>
            <select
              value={infillPattern}
              onChange={(e) => setInfillPattern(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            >
              <option value="Gyroid">Gyroid (Isotropic High Strength)</option>
              <option value="Grid">Grid (Standard)</option>
              <option value="Honeycomb">Honeycomb (Hexagonal)</option>
              <option value="Cubic">Cubic Subdivision</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Print Speed (mm/s):</label>
            <select
              value={printSpeed}
              onChange={(e) => setPrintSpeed(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            >
              <option value="50">50 mm/s (Precision / Outer Walls)</option>
              <option value="80">80 mm/s (Default Mk3S+)</option>
              <option value="150">150 mm/s (High Speed CoreXY)</option>
              <option value="220">220 mm/s (Rapid Voron Mode)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Material Thermoplastics:</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            >
              <option value="PLA">PLA (Polylactic Acid)</option>
              <option value="PETG">PETG (Engineering Tough)</option>
              <option value="ABS">ABS (Heat Resistant 100°C)</option>
              <option value="TPU">TPU (Flexible 95A)</option>
              <option value="PA-CF">PA-CF (Carbon Fiber Composite)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="supports"
              checked={supportsEnabled}
              onChange={(e) => setSupportsEnabled(e.target.checked)}
              className="accent-cyan-400"
            />
            <label htmlFor="supports" className="text-slate-300">Generate Tree Supports for Overhangs</label>
          </div>

          <button
            onClick={handleRunSlicer}
            disabled={isSlicing}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isSlicing ? 'Generating Toolpaths...' : 'Slice & Calculate Kinematics'}
          </button>
        </div>

        {/* CAD & Slicer Simulation Visualizer (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h3 className="font-tech font-bold text-sm text-white">
                3D CAD Slice Simulation Preview
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              G-Code Layer 1..{sliceResult?.layerCount || 240}
            </span>
          </div>

          {/* Sliced Mesh Representation */}
          <div className="relative w-full h-72 my-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Bed Coordinate Grid */}
            <div className="absolute inset-4 rounded border border-slate-800 bg-grid-pattern opacity-20"></div>

            {/* Simulated Sliced Cross-Section Visual */}
            <div className="relative w-52 h-44 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border-2 border-cyan-500/60 shadow-2xl flex flex-col items-center justify-center">
              {/* Internal Gyroid Infill lines */}
              <div className="space-y-2 w-full px-4 opacity-40">
                <div className="h-1 bg-cyan-400 rounded-full w-full"></div>
                <div className="h-1 bg-cyan-400 rounded-full w-4/5 mx-auto"></div>
                <div className="h-1 bg-cyan-400 rounded-full w-full"></div>
                <div className="h-1 bg-cyan-400 rounded-full w-3/4 mx-auto"></div>
              </div>

              <div className="mt-3 text-center font-mono">
                <span className="text-xs font-bold text-cyan-300">{selectedModel}</span>
                <div className="text-[10px] text-slate-400">{material} • {infillPattern} {infillDensity}%</div>
              </div>
            </div>
          </div>

          {/* Estimated Slicing Results Bar */}
          {sliceResult && (
            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-500">PRINT TIME</div>
                <div className="text-emerald-400 font-bold text-sm">
                  {Math.floor(sliceResult.estimatedSeconds / 3600)}h {Math.floor((sliceResult.estimatedSeconds % 3600) / 60)}m
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">TOTAL LAYERS</div>
                <div className="text-white font-bold text-sm">{sliceResult.layerCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">FILAMENT MASS</div>
                <div className="text-cyan-400 font-bold text-sm">{sliceResult.filamentGrams}g</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">FILAMENT LENGTH</div>
                <div className="text-amber-400 font-bold text-sm">{sliceResult.filamentMeters}m</div>
              </div>
            </div>
          )}

          {/* Final Dispatch Button */}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Ready to stream G-code via MQTT to <strong>{activePrinter.name}</strong>
            </span>
            <button
              onClick={handleDispatchPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Dispatch Job to {activePrinter.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
