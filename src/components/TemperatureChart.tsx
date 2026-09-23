import React, { useState } from 'react';
import { TempHistoryPoint } from '../types/printer';

interface TemperatureChartProps {
  data: TempHistoryPoint[];
  height?: number;
  showChamber?: boolean;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  height = 220,
  showChamber = true,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TempHistoryPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-950/60 border border-slate-800 rounded-lg text-slate-500 font-mono text-xs"
        style={{ height }}
      >
        Awaiting telemetry stream...
      </div>
    );
  }

  // Calculate dynamic scale
  const temps = data.flatMap((d) => [d.nozzle, d.nozzleTarget, d.bed, d.bedTarget]);
  const minTemp = Math.max(0, Math.floor(Math.min(...temps) - 10));
  const maxTemp = Math.max(260, Math.ceil(Math.max(...temps) + 15));
  const range = maxTemp - minTemp || 1;

  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const svgWidth = 600;
  const svgHeight = height;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, val));
    return paddingTop + chartHeight - ((clamped - minTemp) / range) * chartHeight;
  };

  // Build SVG path strings
  const nozzlePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.nozzle)}`)
    .join(' ');

  const nozzleTargetPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.nozzleTarget)}`)
    .join(' ');

  const bedPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.bed)}`)
    .join(' ');

  const bedTargetPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.bedTarget)}`)
    .join(' ');

  const chamberPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.chamber)}`)
    .join(' ');

  // Y-axis grid ticks
  const yTicks = [
    minTemp,
    Math.round(minTemp + range * 0.25),
    Math.round(minTemp + range * 0.5),
    Math.round(minTemp + range * 0.75),
    maxTemp,
  ];

  const currentNozzle = data[data.length - 1]?.nozzle ?? 0;
  const currentBed = data[data.length - 1]?.bed ?? 0;
  const currentChamber = data[data.length - 1]?.chamber ?? 0;

  return (
    <div className="relative w-full rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-inner">
      {/* Top Legend & Live Readouts */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-tech">
            Thermal Closed-Loop Telemetry
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1.5s sample</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500"></span>
            <span className="text-slate-400">Nozzle:</span>
            <span className="font-bold text-rose-400">{currentNozzle.toFixed(1)}°C</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500"></span>
            <span className="text-slate-400">Bed:</span>
            <span className="font-bold text-amber-400">{currentBed.toFixed(1)}°C</span>
          </div>

          {showChamber && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400"></span>
              <span className="text-slate-400">Chamber:</span>
              <span className="font-bold text-emerald-400">{currentChamber.toFixed(1)}°C</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="nozzleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bedGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tickVal) => {
            const y = getY(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="2,3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tickVal}°
                </text>
              </g>
            );
          })}

          {/* Target setpoint guide lines (dashed) */}
          <path
            d={nozzleTargetPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity="0.4"
          />
          <path
            d={bedTargetPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity="0.4"
          />

          {/* Actual temp curves */}
          {showChamber && (
            <path
              d={chamberPath}
              fill="none"
              stroke="#34d399"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          <path
            d={bedPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={nozzlePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current endpoint pulsers */}
          {data.length > 0 && (
            <>
              <circle
                cx={getX(data.length - 1)}
                cy={getY(currentNozzle)}
                r="4.5"
                fill="#f43f5e"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <circle
                cx={getX(data.length - 1)}
                cy={getY(currentBed)}
                r="4.5"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </>
          )}

          {/* Interactive hover overlay */}
          {data.map((point, i) => (
            <rect
              key={point.timestamp + i}
              x={getX(i) - (chartWidth / data.length) / 2}
              y={paddingTop}
              width={chartWidth / data.length}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(point)}
              className="cursor-crosshair"
            />
          ))}

          {/* Time axis labels */}
          <text
            x={paddingLeft}
            y={svgHeight - 10}
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {data[0]?.timeLabel || ''}
          </text>
          <text
            x={svgWidth - paddingRight}
            y={svgHeight - 10}
            textAnchor="end"
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            Now ({data[data.length - 1]?.timeLabel || ''})
          </text>
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-950/95 border border-cyan-500/40 rounded-lg p-2.5 shadow-xl text-xs font-mono pointer-events-none z-10 backdrop-blur-md">
            <div className="text-[10px] text-cyan-400 font-semibold mb-1 pb-1 border-b border-slate-800">
              TIME: {hoveredPoint.timeLabel}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
              <div>
                Nozzle:{' '}
                <span className="text-rose-400 font-bold">{hoveredPoint.nozzle}°C</span>
                <span className="text-slate-500 text-[10px]"> / {hoveredPoint.nozzleTarget}°C</span>
              </div>
              <div>
                Bed:{' '}
                <span className="text-amber-400 font-bold">{hoveredPoint.bed}°C</span>
                <span className="text-slate-500 text-[10px]"> / {hoveredPoint.bedTarget}°C</span>
              </div>
              {showChamber && (
                <div className="col-span-2">
                  Chamber:{' '}
                  <span className="text-emerald-400 font-bold">{hoveredPoint.chamber}°C</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/40">
        <span>Target: Solid = Actual | Dashed = PID Setpoint</span>
        <span>Sampling Rate: 0.67 Hz</span>
      </div>
    </div>
  );
};
