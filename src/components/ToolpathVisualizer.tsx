import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Box,
  Eye,
  Flame,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface ToolpathVisualizerProps {
  currentLayer: number;
  totalLayers: number;
  xPos: number;
  yPos: number;
  zPos: number;
  printSpeed: number;
  currentGcode: string;
  isPrinting?: boolean;
  filamentColor?: string;
  jobName?: string;
  progressPercent?: number;
}

export const ToolpathVisualizer: React.FC<ToolpathVisualizerProps> = ({
  currentLayer,
  totalLayers,
  xPos,
  yPos,
  zPos,
  printSpeed,
  currentGcode,
  isPrinting = true,
  filamentColor = '#06b6d4',
  jobName,
  progressPercent = 42,
}) => {
  const [viewMode, setViewMode] = useState<'top' | 'isometric' | 'layer_stack'>('isometric');
  const [animPlaying, setAnimPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [scrubbedLayer, setScrubbedLayer] = useState<number>(currentLayer);
  const [zoom, setZoom] = useState<number>(1);

  // Dynamic animation toolhead position coordinates
  const [animX, setAnimX] = useState<number>(xPos);
  const [animY, setAnimY] = useState<number>(yPos);
  const [extrusionPulse, setExtrusionPulse] = useState<number>(0);
  const [extrudedPoints, setExtrudedPoints] = useState<Array<{ x: number; y: number }>>([]);

  const animFrameRef = useRef<number | null>(null);
  const pathAngleRef = useRef<number>(0);

  // Synchronize scrubbed layer with incoming telemetry
  useEffect(() => {
    setScrubbedLayer(currentLayer);
  }, [currentLayer]);

  // Bed dimensions in mm (Standard 250 x 210 for Prusa MK3S/MK4)
  const bedWidthMm = 250;
  const bedDepthMm = 210;

  // Active printing continuous kinematics loop
  useEffect(() => {
    if (!animPlaying || !isPrinting) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      pathAngleRef.current += dt * 1.8 * animSpeed;
      const angle = pathAngleRef.current;

      // Complex mechanical toolpath trajectory (parametric gear / bracket contour)
      const centerX = 125;
      const centerY = 105;
      const radiusX = 42 + Math.sin(angle * 3) * 12;
      const radiusY = 36 + Math.cos(angle * 3) * 10;

      const targetX = centerX + Math.cos(angle) * radiusX;
      const targetY = centerY + Math.sin(angle) * radiusY;

      setAnimX(targetX);
      setAnimY(targetY);
      setExtrusionPulse((prev) => (prev + dt * 6) % 1);

      // Add to extruded trail points
      setExtrudedPoints((prev) => {
        const next = [...prev, { x: targetX, y: targetY }];
        if (next.length > 55) next.shift();
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animPlaying, isPrinting, animSpeed]);

  // Effective coordinates to render
  const activeX = isPrinting && animPlaying ? animX : xPos;
  const activeY = isPrinting && animPlaying ? animY : yPos;

  // Normalize coordinates to percentage of bed
  const nozzlePercentX = Math.max(8, Math.min(92, (activeX / bedWidthMm) * 100));
  const nozzlePercentY = Math.max(8, Math.min(92, 100 - (activeY / bedDepthMm) * 100));

  // Layer stack count for 3D slice visualization
  const displayLayer = scrubbedLayer || currentLayer || 1;
  const maxLayersDisplay = Math.min(18, Math.max(4, Math.floor((displayLayer / (totalLayers || 100)) * 18)));

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-xl">
      {/* Header Bar with Mode Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            {isPrinting && animPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            )}
          </div>
          <div>
            <span className="text-xs font-tech font-bold text-white uppercase tracking-wider">
              Real-Time Toolpath & Job Kinematics
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              {isPrinting ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Extrusion Loop • {printSpeed} mm/s
                </span>
              ) : (
                <span className="text-slate-400">Idle / Standby Kinematics</span>
              )}
            </div>
          </div>
        </div>

        {/* View Mode & Animation Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {/* Play/Pause Animation Toggle */}
          <button
            onClick={() => setAnimPlaying(!animPlaying)}
            className={`p-1.5 rounded-lg border transition-all ${
              animPlaying
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={animPlaying ? 'Pause Toolpath Animation' : 'Resume Toolpath Animation'}
          >
            {animPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Speed Selector */}
          <button
            onClick={() => setAnimSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 flex items-center gap-1"
            title="Cycle Animation Speed"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>{animSpeed}x</span>
          </button>

          {/* View Mode Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === 'isometric'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Iso
            </button>
            <button
              onClick={() => setViewMode('top')}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === 'top'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Top
            </button>
            <button
              onClick={() => setViewMode('layer_stack')}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === 'layer_stack'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stack
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Animated Bed & Kinematics Canvas */}
      <div
        className="relative w-full h-64 sm:h-72 my-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-center overflow-hidden select-none"
        style={{
          transform:
            viewMode === 'isometric'
              ? 'perspective(750px) rotateX(28deg) rotateZ(-12deg) scale(0.96)'
              : viewMode === 'layer_stack'
              ? 'perspective(650px) rotateX(45deg) rotateZ(-20deg) scale(0.92)'
              : 'none',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* PEI Heated Print Bed Grid */}
        <div
          className="absolute inset-4 rounded-xl border-2 border-slate-700/70 bg-slate-900/60 shadow-2xl overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(6, 182, 212, 0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.09) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Bed Heat Texture Glow Effect */}
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>

          {/* Bed Origin Marker (0,0) */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/90 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            (0, 0) Origin
          </div>

          {/* Bed Maximum Extents Tag */}
          <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 z-10">
            250 × 210 mm
          </div>

          {/* Sliced Layer Stack Visualization in 3D Mode */}
          {viewMode === 'layer_stack' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-44 h-40">
                {Array.from({ length: maxLayersDisplay }).map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 rounded-xl border border-cyan-500/30 transition-all duration-300"
                    style={{
                      transform: `translateY(-${idx * 3.5}px) translateZ(${idx * 2}px)`,
                      backgroundColor:
                        idx === maxLayersDisplay - 1
                          ? `${filamentColor}33`
                          : 'rgba(6, 182, 212, 0.04)',
                      borderColor:
                        idx === maxLayersDisplay - 1 ? filamentColor : 'rgba(6, 182, 212, 0.25)',
                      boxShadow:
                        idx === maxLayersDisplay - 1
                          ? `0 0 10px ${filamentColor}88`
                          : 'none',
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Active SVG Toolpath Contour & Trailing Bead */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Background Model Base Geometry Boundary */}
            <rect
              x="26%"
              y="22%"
              width="48%"
              height="56%"
              rx="16"
              fill="rgba(6, 182, 212, 0.03)"
              stroke="rgba(6, 182, 212, 0.2)"
              strokeWidth="1.5"
            />

            {/* Inner Perimeter Wall */}
            <rect
              x="30%"
              y="26%"
              width="40%"
              height="48%"
              rx="10"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4,2"
              opacity="0.8"
            />

            {/* Dynamic Gyroid Infill Lattice Geometry */}
            <path
              d="M 33% 36% Q 42% 30% 50% 38% T 67% 36% M 33% 46% Q 42% 54% 50% 44% T 67% 50% M 33% 56% Q 42% 62% 50% 54% T 67% 58% M 33% 66% Q 42% 70% 50% 64% T 67% 68%"
              fill="none"
              stroke="rgba(14, 165, 233, 0.4)"
              strokeWidth="1.4"
            />

            {/* Live Extrusion Path Trail */}
            {extrudedPoints.length > 1 && (
              <polyline
                points={extrudedPoints
                  .map((p) => {
                    const px = Math.max(8, Math.min(92, (p.x / bedWidthMm) * 100));
                    const py = Math.max(8, Math.min(92, 100 - (p.y / bedDepthMm) * 100));
                    return `${px}%,${py}%`;
                  })
                  .join(' ')}
                fill="none"
                stroke={filamentColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
                style={{
                  filter: `drop-shadow(0 0 4px ${filamentColor})`,
                }}
              />
            )}

            {/* Laser Rapid Travel Guide Line to Toolhead */}
            <line
              x1="30%"
              y1="26%"
              x2={`${nozzlePercentX}%`}
              y2={`${nozzlePercentY}%`}
              stroke="#f43f5e"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.5"
            />
          </svg>

          {/* Animated 3D Nozzle & Extrusion Bead Assembly */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-transform duration-75 ease-out"
            style={{
              left: `${nozzlePercentX}%`,
              top: `${nozzlePercentY}%`,
            }}
          >
            {/* Hotend Tip & Heat Halo */}
            <div className="relative flex items-center justify-center w-12 h-12">
              {/* Molten Filament Deposition Bead */}
              {isPrinting && animPlaying && (
                <span
                  className="absolute w-8 h-8 rounded-full animate-ping opacity-75"
                  style={{
                    backgroundColor: `${filamentColor}40`,
                    borderColor: filamentColor,
                  }}
                ></span>
              )}

              {/* Nozzle Heater Block Reticle */}
              <div
                className="w-6 h-6 rounded-full border-2 border-white bg-slate-950 flex items-center justify-center shadow-lg"
                style={{
                  borderColor: isPrinting ? '#f43f5e' : '#06b6d4',
                  boxShadow: isPrinting
                    ? '0 0 14px rgba(244, 63, 94, 0.8), 0 0 24px rgba(6, 182, 212, 0.4)'
                    : '0 0 8px rgba(6, 182, 212, 0.5)',
                }}
              >
                {/* Hot Molten Core Dot */}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isPrinting ? '#ffedd5' : filamentColor,
                    boxShadow: '0 0 6px #fff',
                  }}
                ></span>
              </div>

              {/* Toolhead Floating HUD Tag */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded-md border border-cyan-500/40 shadow-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>
                  X:{activeX.toFixed(1)} Y:{activeY.toFixed(1)}
                </span>
                <span className="text-slate-400">Z:{zPos.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 backdrop-blur-md z-30 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setViewMode('isometric');
            }}
            className="p-1 text-slate-400 hover:text-white"
            title="Reset Kinematic View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Animation Scrubber Slider */}
      <div className="px-1 py-1.5 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layer Simulation Sequence:</span>
            <strong className="text-white">
              {scrubbedLayer} / {totalLayers || 100}
            </strong>
          </div>
          <span className="text-cyan-400 font-bold">
            {Math.round((scrubbedLayer / (totalLayers || 100)) * 100)}% Sliced
          </span>
        </div>

        <input
          type="range"
          min="1"
          max={totalLayers || 100}
          value={scrubbedLayer}
          onChange={(e) => setScrubbedLayer(parseInt(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Real-time Kinematic Metric Cards Grid */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">X Axis</div>
          <div className="text-cyan-400 font-bold text-sm">
            {activeX.toFixed(2)}{' '}
            <span className="text-[10px] text-slate-500 font-normal">mm</span>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Y Axis</div>
          <div className="text-cyan-400 font-bold text-sm">
            {activeY.toFixed(2)}{' '}
            <span className="text-[10px] text-slate-500 font-normal">mm</span>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Z Height</div>
          <div className="text-cyan-400 font-bold text-sm">
            {zPos.toFixed(2)}{' '}
            <span className="text-[10px] text-slate-500 font-normal">mm</span>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
          <div className="text-emerald-400 font-bold text-sm">
            {isPrinting && animPlaying ? printSpeed : 0}{' '}
            <span className="text-[10px] text-slate-500 font-normal">mm/s</span>
          </div>
        </div>
      </div>

      {/* Live G-code Stream Line */}
      <div className="mt-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
            STREAM
          </span>
          <span className="text-slate-200 truncate">
            {currentGcode || `G1 X${activeX.toFixed(2)} Y${activeY.toFixed(2)} E1840.42 F4500`}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 ml-2 shrink-0">
          Buffer: <strong className="text-slate-300">16 blks</strong>
        </span>
      </div>
    </div>
  );
};
