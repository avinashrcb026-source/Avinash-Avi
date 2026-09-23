import React from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  RefreshCw,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

export const AiInsightsView: React.FC = () => {
  const {
    activePrinter,
    aiReport,
    isAiDiagnosing,
    runAiDiagnostics,
    faults,
    activeScenario,
    injectScenario,
  } = usePrinter();

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'elevated':
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              AI Predictive Machine Diagnostics & Anomaly Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Powered by Gemini 3.8 Flash via secure server-side proxy • Thermal hysteresis, extrusion rheology, and mechanical wear forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={runAiDiagnostics}
            disabled={isAiDiagnosing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            {isAiDiagnosing ? 'Inference in Progress...' : 'Run Full AI Diagnostic Audit'}
          </button>
        </div>
      </div>

      {/* AI Advisory Labeling Requirement from Prompt */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Engineering Advisory Classification:</strong> AI findings are computational predictions designed to assist certified technicians and prevent equipment damage. Automated machine overrides require human engineering sign-off.
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700 uppercase font-bold shrink-0 ml-2">
          Advisory Only
        </span>
      </div>

      {/* AI Health Score & Risk Gauge Card */}
      {aiReport ? (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getRiskBadge(aiReport.riskLevel)}`}>
                  RISK: {aiReport.riskLevel}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: <strong>{activePrinter.name}</strong> • Timestamp: {new Date(aiReport.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-tech font-bold text-white mt-1">{aiReport.headline}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Overall Machine Health</div>
                <div className="text-3xl font-tech font-bold text-cyan-400">
                  {aiReport.overallHealthScore}<span className="text-slate-600 text-base">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dives: Telemetry Analysis & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Real-Time Telemetry Rheology
              </div>
              <p className="text-slate-300 leading-relaxed">{aiReport.telemetryAnalysis}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Root Cause & Pattern Classification
              </div>
              <p className="text-slate-300 leading-relaxed">
                {aiReport.rootCauseAnalysis ||
                  (aiReport.identifiedPatterns?.[0]
                    ? `${aiReport.identifiedPatterns[0].title}: ${aiReport.identifiedPatterns[0].possibleRootCause}`
                    : 'All physical indicators within nominal threshold bounds.')}
              </p>
            </div>
          </div>

          {/* Corrective Actions & SOP Recommendations */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Prescribed Corrective Engineering Actions (SOP)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(aiReport.recommendedActions ||
                (aiReport.identifiedPatterns?.map((p) => p.recommendedMitigation) ?? [
                  'Maintain continuous monitoring of hotend thermistor loop.',
                  'Inspect PEI bed sheet adhesion and wipe with isopropyl alcohol.',
                  'Perform routine lubrication of linear Z-axis lead screw.',
                ])
              ).map((action: string, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preventive Suggestion */}
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono text-cyan-200 flex items-center justify-between">
            <span>
              <strong>Long-Term Preventive Maintenance:</strong>{' '}
              {aiReport.preventativeSuggestion ||
                'Ensure clean environmental filtration and schedule PID autotune after 100 hours of continuous print cycle.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono space-y-3">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-lg font-tech font-bold text-white">AI Diagnostic Engine Ready</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Click &quot;Run Full AI Diagnostic Audit&quot; to stream the current 12-bit thermistor readings, optical rotary slip, ADXL345 vibration data, and computer vision inferences into the Gemini 3.8 Flash model.
          </p>
          <button
            onClick={runAiDiagnostics}
            disabled={isAiDiagnosing}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs"
          >
            {isAiDiagnosing ? 'Analyzing...' : 'Execute Diagnostic Scan'}
          </button>
        </div>
      )}
    </div>
  );
};
