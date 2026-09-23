import React, { useRef, useEffect } from 'react';
import {
  Network,
  Cpu,
  Server,
  Cloud,
  Terminal,
  Activity,
  Shield,
  Wifi,
  Radio,
  ArrowRight,
  Database,
  Smartphone,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

export const ArchitectureView: React.FC = () => {
  const { activePrinter, serialLogs } = usePrinter();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serialLogs]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Industrial IoT (IIoT) Cloud & Edge Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physical Hardware → ESP32/Pi4 Gateway → MQTT Broker → Cloud API → Multi-Role Web Dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            ● Edge Broker Online (8883 MQTTS)
          </span>
        </div>
      </div>

      {/* Interactive System Architecture Flow Diagram (Prompt Section 1) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <h3 className="font-tech font-bold text-sm text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          End-to-End Additive Manufacturing Data Pipeline
        </h3>

        <div className="flex items-stretch justify-between gap-2 min-w-[760px] text-xs font-mono">
          {/* Node 1: Physical Printer */}
          <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/60 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              3D PRINTER HARDWARE
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• Heated Bed & Hotend</div>
              <div>• TMC2209 Steppers (X/Y/Z/E)</div>
              <div>• PEI Spring Steel Sheet</div>
              <div>• 24V Mean Well PSU</div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Protocol: UART G-Code
            </div>
          </div>

          <div className="flex items-center text-slate-600 font-bold text-lg">→</div>

          {/* Node 2: Sensor Bus */}
          <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <Cpu className="w-4 h-4" />
              SENSORS & PROBES
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• PT1000 & Semitec Thermistors</div>
              <div>• ADXL345 Vibration (SPI)</div>
              <div>• INA219 Current / Power (I2C)</div>
              <div>• Optical Rotary Encoder (GPIO)</div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Protocol: I2C / SPI / ADC
            </div>
          </div>

          <div className="flex items-center text-slate-600 font-bold text-lg">→</div>

          {/* Node 3: Edge Gateway */}
          <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
              <Radio className="w-4 h-4" />
              EDGE GATEWAY
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• ESP32 WROOM-32 Sensor Hub</div>
              <div>• Raspberry Pi 4 (Klipper Host)</div>
              <div>• Sony IMX219 Camera CSI-2</div>
              <div>• Local Watchdog Fail-Safe</div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Protocol: MQTTS / WebSockets
            </div>
          </div>

          <div className="flex items-center text-slate-600 font-bold text-lg">→</div>

          {/* Node 4: Cloud Platform */}
          <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-purple-500/60 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold">
              <Cloud className="w-4 h-4" />
              CLOUD IIoT BACKEND
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• Express API & Telemetry Ingestion</div>
              <div>• TimescaleDB Sensor History</div>
              <div>• Gemini 3.8 Flash AI Inference</div>
              <div>• RBAC Token Validation</div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Transport: HTTPS / TLS 1.3
            </div>
          </div>

          <div className="flex items-center text-slate-600 font-bold text-lg">→</div>

          {/* Node 5: Client Dashboard */}
          <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/60 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
              <Smartphone className="w-4 h-4" />
              CLIENT DASHBOARD
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• Web & Mobile App (React 19)</div>
              <div>• Real-Time Control & Telemetry</div>
              <div>• AI Vision Spaghetti Alarms</div>
              <div>• Indian Industrial IIoT UI</div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Role: Admin / Eng / Operator
            </div>
          </div>
        </div>
      </div>

      {/* Live Edge Gateway Serial Terminal Log Stream */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-tech font-bold text-sm text-white">
              Live Edge Gateway Serial Console & MQTT Telemetry Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            TTY /dev/ttyUSB0 (115200 baud)
          </span>
        </div>

        {/* Terminal Window */}
        <div className="w-full h-64 bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1 shadow-inner">
          {serialLogs.map((log, index) => (
            <div key={index} className="leading-tight">
              <span className="text-slate-500 select-none mr-2">$</span>
              {log}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
          <span>Active Edge Node: {activePrinter.edgeGateway.type} ({activePrinter.edgeGateway.ip})</span>
          <span>Buffer: Circular FIFO 40 entries</span>
        </div>
      </div>
    </div>
  );
};
