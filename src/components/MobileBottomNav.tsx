import React, { useState } from 'react';
import {
  Home,
  Layers,
  AlertTriangle,
  FolderArchive,
  User,
  Sliders,
  Play,
  Pause,
  Camera,
  Zap,
  X,
  Shield,
  CheckCircle2,
  Power,
  Flame,
  Snowflake,
  ExternalLink,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenEstopModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
  onOpenEstopModal,
}) => {
  const {
    activePrinter,
    activeFaultsCount,
    pauseJob,
    resumeJob,
    startJob,
    preheatPreset,
    canExecuteControl,
    currentUser,
    sendNotification,
  } = usePrinter();

  const [isActionOverlayOpen, setIsActionOverlayOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isPrinting = activePrinter.status === 'printing';
  const isPaused = activePrinter.status === 'paused';
  const job = activePrinter.currentJob;

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 2800);
  };

  const handlePauseToggle = () => {
    if (!canExecuteControl) {
      showFeedback('Access Denied: Viewer role is read-only');
      return;
    }
    if (isPrinting) {
      pauseJob();
      showFeedback(`Paused print: ${job?.fileName || activePrinter.name}`);
    } else if (isPaused) {
      resumeJob();
      showFeedback(`Resumed print: ${job?.fileName || activePrinter.name}`);
    } else {
      startJob();
      showFeedback(`Dispatched job on ${activePrinter.name}`);
    }
  };

  const handleSnapshot = () => {
    const timestamp = new Date().toLocaleTimeString();
    sendNotification({
      title: 'Optical Frame Snapshot Captured',
      message: `CSI-2 Camera snapshot captured for ${activePrinter.name} at ${timestamp} (1080p IMX219).`,
      severity: 'info',
      machineId: activePrinter.id,
      category: 'ai',
    });
    showFeedback(`Snapshot captured at ${timestamp}`);
  };

  const handleQuickCooldown = () => {
    if (!canExecuteControl) {
      showFeedback('Access Denied: Viewer role is read-only');
      return;
    }
    preheatPreset('COOLDOWN');
    showFeedback('Heaters powered off (Cooldown)');
  };

  const handleQuickPreheatPLA = () => {
    if (!canExecuteControl) {
      showFeedback('Access Denied: Viewer role is read-only');
      return;
    }
    preheatPreset('PLA');
    showFeedback('Preheating PLA (215°C / 60°C)');
  };

  return (
    <>
      {/* Backdrop for Mini Overlay */}
      {isActionOverlayOpen && (
        <div
          onClick={() => setIsActionOverlayOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* Mini Overlay with High-Frequency Controls */}
      {isActionOverlayOpen && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200 space-y-3 font-mono">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div>
                <span className="text-xs font-tech font-bold text-white tracking-wide">
                  FAST ACTION CONSOLE
                </span>
                <div className="text-[10px] text-slate-400">
                  {activePrinter.name} •{' '}
                  <span
                    className={`uppercase font-bold ${
                      isPrinting
                        ? 'text-emerald-400'
                        : isPaused
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {activePrinter.status}
                    {job ? ` (${job.progressPercent}%)` : ''}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsActionOverlayOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
              aria-label="Close fast action menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Temporary Action Toast Notification */}
          {actionFeedback && (
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{actionFeedback}</span>
            </div>
          )}

          {/* Read-Only Warning if Viewer */}
          {!canExecuteControl && (
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-300 text-[10px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Viewer Role: Machine control commands disabled.</span>
            </div>
          )}

          {/* Primary High-Frequency Action Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Pause / Resume Toggle */}
            {isPrinting ? (
              <button
                onClick={handlePauseToggle}
                disabled={!canExecuteControl}
                className="py-3 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                <Pause className="w-4 h-4 fill-amber-300" />
                <span>Pause Print</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={handlePauseToggle}
                disabled={!canExecuteControl}
                className="py-3 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-emerald-300" />
                <span>Resume Print</span>
              </button>
            ) : (
              <button
                onClick={handlePauseToggle}
                disabled={!canExecuteControl}
                className="py-3 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                <Play className="w-4 h-4" />
                <span>Start Job</span>
              </button>
            )}

            {/* 2. Camera Snapshot */}
            <button
              onClick={handleSnapshot}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Snapshot</span>
            </button>
          </div>

          {/* Secondary Quick Toggles */}
          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            <button
              onClick={handleQuickPreheatPLA}
              disabled={!canExecuteControl}
              className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-rose-300 flex items-center justify-center gap-1 transition-all disabled:opacity-40"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Preheat</span>
            </button>

            <button
              onClick={handleQuickCooldown}
              disabled={!canExecuteControl}
              className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-blue-300 flex items-center justify-center gap-1 transition-all disabled:opacity-40"
            >
              <Snowflake className="w-3 h-3 text-blue-400" />
              <span>Cooldown</span>
            </button>

            {onOpenEstopModal ? (
              <button
                onClick={() => {
                  setIsActionOverlayOpen(false);
                  onOpenEstopModal();
                }}
                className="py-2 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Power className="w-3 h-3 text-rose-400" />
                <span>ESTOP</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsActionOverlayOpen(false);
                  setCurrentTab('camera');
                }}
                className="py-2 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center gap-1 transition-all"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1 flex items-center justify-around shadow-2xl">
        {/* Home */}
        <button
          onClick={() => {
            setIsActionOverlayOpen(false);
            setCurrentTab('dashboard');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'dashboard'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Home</span>
        </button>

        {/* Fleet */}
        <button
          onClick={() => {
            setIsActionOverlayOpen(false);
            setCurrentTab('fleet');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'fleet'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Printers</span>
        </button>

        {/* HIGH-FREQUENCY 'ACTION' BUTTON (Prominent Center Button) */}
        <button
          onClick={() => setIsActionOverlayOpen(!isActionOverlayOpen)}
          className={`relative -top-2 flex flex-col items-center justify-center p-2 rounded-xl transition-all shadow-lg active:scale-95 ${
            isActionOverlayOpen
              ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/40 ring-2 ring-cyan-300'
              : 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-cyan-900/50 hover:brightness-110'
          }`}
          aria-label="Toggle Quick Action Overlay"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-tech font-bold uppercase tracking-wider mt-0.5">
            Action
          </span>
        </button>

        {/* Control */}
        <button
          onClick={() => {
            setIsActionOverlayOpen(false);
            setCurrentTab('control');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'control'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Control</span>
        </button>

        {/* Alerts with Badge */}
        <button
          onClick={() => {
            setIsActionOverlayOpen(false);
            setCurrentTab('faults');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'faults'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Alerts</span>
          {activeFaultsCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
              {activeFaultsCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            setIsActionOverlayOpen(false);
            onOpenAuthModal();
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-slate-400 hover:text-slate-200"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Profile</span>
        </button>
      </div>
    </>
  );
};
