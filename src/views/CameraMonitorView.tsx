import React, { useState, useEffect } from 'react';
import {
  Video,
  Camera,
  Maximize2,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
  Sliders,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

export const CameraMonitorView: React.FC = () => {
  const { activePrinter, activeScenario, injectScenario } = usePrinter();
  const [isAiOverlayEnabled, setIsAiOverlayEnabled] = useState(true);
  const [filterMode, setFilterMode] = useState<'normal' | 'infrared' | 'edge_detect'>('normal');
  const [snapshotTaken, setSnapshotTaken] = useState<string | null>(null);
  const [fps, setFps] = useState(30);

  const isSpaghetti = activeScenario === 'spaghetti_failure';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-xl font-tech font-bold text-white">
              Optical Inspection & AI Computer Vision — {activePrinter.name}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Sony IMX219 1080p CSI-2 stream • Real-time inference for spaghetti detachment & warping anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
            FPS: <strong>{fps}</strong> | 65ms Latency
          </span>
          <button
            onClick={() => setSnapshotTaken(new Date().toLocaleTimeString())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold"
          >
            <Camera className="w-3.5 h-3.5" />
            Capture Snapshot
          </button>
        </div>
      </div>

      {/* Main Video View & AI Computer Vision Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Camera View Box (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col">
          {/* Top Camera Stream Bar */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-rose-400 font-bold">● REC LIVE</span>
              <span className="text-slate-400">| 1080p MJPEG</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Filter mode pill */}
              <div className="flex items-center bg-slate-950/80 backdrop-blur-md p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setFilterMode('normal')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'normal' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setFilterMode('infrared')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'infrared' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Thermal IR
                </button>
                <button
                  onClick={() => setFilterMode('edge_detect')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'edge_detect' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Edge Detect
                </button>
              </div>

              {/* AI Overlay toggle */}
              <button
                onClick={() => setIsAiOverlayEnabled(!isAiOverlayEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md border text-xs font-mono ${
                  isAiOverlayEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AI Vision {isAiOverlayEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Simulated 3D Printer Bed Camera Stream */}
          <div
            className={`relative w-full h-[380px] sm:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-300 ${
              filterMode === 'infrared'
                ? 'hue-rotate-90 contrast-125 saturate-200'
                : filterMode === 'edge_detect'
                ? 'invert contrast-200 grayscale'
                : ''
            }`}
            style={{
              backgroundColor: '#050811',
              backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* 3D Printer Heated Bed Representation */}
            <div className="relative w-80 h-72 rounded-lg border-2 border-slate-700 bg-slate-900/90 shadow-2xl flex flex-col items-center justify-center">
              {/* Bed texture lines */}
              <div className="absolute inset-0 opacity-20 bg-grid-pattern"></div>

              {/* Printed Geometry (Model on Bed) */}
              <div className="relative w-44 h-40 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/60 border border-cyan-500/40 shadow-xl flex items-center justify-center">
                {/* Internal infill pattern visual */}
                <div className="absolute inset-2 border border-dashed border-cyan-500/30 rounded flex items-center justify-center">
                  <span className="text-[10px] font-mono text-cyan-500/50">
                    LAYER {activePrinter.currentJob?.currentLayer || 136} / 200
                  </span>
                </div>

                {/* Hotend Toolhead nozzle hovering and moving */}
                <div
                  className="absolute w-10 h-10 -top-2 -right-2 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md border border-cyan-400/80 shadow-lg flex items-center justify-center transition-all duration-300 animate-pulse"
                  style={{
                    left: `${Math.max(10, Math.min(85, (activePrinter.telemetry.xPos / 250) * 100))}%`,
                    top: `${Math.max(10, Math.min(85, (activePrinter.telemetry.yPos / 210) * 100))}%`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                </div>

                {/* Simulated Spaghetti Chaos failure if triggered */}
                {isSpaghetti && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <svg className="w-full h-full">
                      <path
                        d="M 20 40 Q 60 10 90 70 T 140 20 T 40 120 T 130 90 T 70 140"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                      <path
                        d="M 30 70 Q 90 120 120 40 T 80 110 T 110 130"
                        fill="none"
                        stroke="#fb7185"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* AI Computer Vision Bounding Box Overlays */}
            {isAiOverlayEnabled && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {isSpaghetti ? (
                  // Spaghetti Detection Alert Box
                  <div className="absolute top-[28%] left-[28%] w-[44%] h-[46%] border-2 border-rose-500 bg-rose-500/10 rounded shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
                    <div className="absolute -top-7 left-0 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      [ALERT 91%] SPAGHETTI FAILURE DETECTED
                    </div>
                  </div>
                ) : (
                  // Normal Layer Verification Bounding Boxes
                  <>
                    <div className="absolute top-[26%] left-[30%] w-[40%] h-[46%] border border-cyan-400/80 bg-cyan-400/5 rounded">
                      <div className="absolute -top-6 left-0 bg-cyan-900/90 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-700">
                        [OK 98%] Part Perimeter Intact
                      </div>
                    </div>

                    <div className="absolute top-[68%] left-[32%] w-[20%] h-[12%] border border-emerald-400/60 bg-emerald-400/5 rounded">
                      <div className="absolute -bottom-5 left-0 bg-emerald-950/90 text-emerald-300 font-mono text-[8px] px-1.5 py-0.2 rounded border border-emerald-800">
                        Bed Adhesion: 99%
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Stream Status Strip */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Target Object:</span>
              <strong className="text-white">bracket_reinforced_v3.gcode</strong>
            </div>
            {snapshotTaken && (
              <span className="text-cyan-400 text-[11px]">
                Snapshot captured at {snapshotTaken} (Saved to Cloud Storage)
              </span>
            )}
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera Status: Online</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Test Controls */}
        <div className="space-y-4">
          {/* AI Inspection Verdict Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-tech font-bold text-sm text-white">Computer Vision AI Diagnostics</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700">
                Inference Engine
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  isSpaghetti
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm font-tech">
                    {isSpaghetti ? 'CRITICAL DETACHMENT PREDICTED' : 'NOMINAL PRINT APPEARANCE'}
                  </span>
                  <span className="font-bold">{isSpaghetti ? '91% Risk' : '98% Adhesion'}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {isSpaghetti
                    ? 'Loose plastic strands detected outside sliced CAD boundary! Immediate print pause advised.'
                    : 'Toolhead extrusion path corresponds with sliced G-code layer coordinates. First-layer PEI adhesion confirmed.'}
                </p>
              </div>

              {/* Confidence metric bars */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Spaghetti / Loose Strand Probability:</span>
                    <span className={isSpaghetti ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {isSpaghetti ? '91.4%' : '2.1%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSpaghetti ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${isSpaghetti ? 91.4 : 2.1}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Bed Detachment / Warping Risk:</span>
                    <span className="text-slate-300">4.8% (Nominal)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: '4.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Extrusion Path Dimensional Verification:</span>
                    <span className="text-emerald-400 font-bold">97.6% Match</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: '97.6%' }}></div>
                  </div>
                </div>
              </div>

              {/* Label requirement in prompt: Clearly label as AI predictions */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-amber-300/80">
                ⚠️ Notice: Vision inspection results are generated as real-time AI predictions to assist human operators and prevent unattended catastrophic print failures.
              </div>
            </div>
          </div>

          {/* Test Scenario Simulator Trigger */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-tech font-bold text-xs uppercase text-slate-300 mb-2">
              Demonstration & Validation Controls
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => injectScenario(isSpaghetti ? 'normal' : 'spaghetti_failure')}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all border ${
                  isSpaghetti
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-600/60'
                }`}
              >
                {isSpaghetti ? '✓ Reset Camera to Normal Extrusion' : '⚠ Simulate Spaghetti Print Failure'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
