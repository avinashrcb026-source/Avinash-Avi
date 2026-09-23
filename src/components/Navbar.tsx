import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Video,
  Sliders,
  FolderArchive,
  AlertTriangle,
  Cpu,
  BarChart3,
  Wrench,
  Sparkles,
  Network,
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  Shield,
  HelpCircle,
  Menu,
  X,
  Play,
  Share2,
  GraduationCap,
  HardDrive,
  Database,
} from 'lucide-react';
import { usePrinter, DemoScenario } from '../context/PrinterContext';
import { UserRole } from '../types/printer';
import { FleetGlobalProgressBar } from './FleetGlobalProgressBar';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenScenarioModal: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  onOpenEstopModal: () => void;
  onOpenUsbSsdModal?: () => void;
  onOpenCadDataModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenScenarioModal,
  onOpenNotifications,
  onOpenAuthModal,
  onOpenEstopModal,
  onOpenUsbSsdModal,
  onOpenCadDataModal,
}) => {
  const {
    printers,
    activePrinterId,
    setActivePrinterId,
    activePrinter,
    isDemoMode,
    unreadNotifsCount,
    activeFaultsCount,
    audioEnabled,
    setAudioEnabled,
    currentUser,
  } = usePrinter();

  const [printerDropdownOpen, setPrinterDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'fleet', label: 'Fleet', icon: Layers },
    { id: 'live-monitor', label: 'Live Monitor', icon: Sliders },
    { id: 'camera', label: 'Camera AI', icon: Video },
    { id: 'control', label: 'Remote Control', icon: Sliders },
    { id: 'filament', label: 'Filament', icon: Share2 },
    { id: 'files', label: 'Print Files', icon: FolderArchive },
    { id: 'faults', label: 'Faults & Alerts', icon: AlertTriangle, badge: activeFaultsCount },
    { id: 'sensors', label: 'Sensors', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'ai-insights', label: 'AI Diagnostics', icon: Sparkles, highlight: true },
    { id: 'slicer', label: 'Design→Slice→Print', icon: Layers },
    { id: 'architecture', label: 'Cloud IIoT Edge', icon: Network },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'printing':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'error':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'paused':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'offline':
        return 'bg-slate-700/40 text-slate-400 border-slate-600';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* College & Department Institutional Banner */}
      <div className="w-full bg-gradient-to-r from-blue-950/90 via-slate-900 to-cyan-950/90 border-b border-cyan-500/30 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-cyan-200">
          <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-tech font-bold text-white tracking-wide text-xs sm:text-sm uppercase">
                Kamala Institute of Technology and Science
              </span>
              <span className="text-cyan-500/60 hidden sm:inline">•</span>
              <span className="text-cyan-300 font-semibold text-[11px] sm:text-xs uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                Mechanical Department
              </span>
            </div>
            {/* Directly below the college name */}
            <div className="text-[10px] sm:text-[11px] text-cyan-400 font-mono tracking-wider font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="uppercase tracking-wider">3D FDM with Cloud Integrated</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* USB / SSD CAD Access Button */}
          <button
            onClick={onOpenUsbSsdModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/50 text-[11px] font-mono font-bold shadow-sm transition-all active:scale-95"
            title="Access USB flash drive & NVMe SSD CAD storage"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">USB / SSD CAD</span>
            <span className="sm:hidden">USB/SSD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* CAD Data Access Button */}
          <button
            onClick={onOpenCadDataModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400/50 text-[11px] font-mono font-bold shadow-sm transition-all active:scale-95"
            title="Access Central Engineering CAD Data Repository"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CAD Data</span>
            <span className="sm:hidden">CAD</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 ml-1">
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              Smart Additive Manufacturing & IIoT Lab
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">Campus Node Online</span>
          </div>
        </div>
      </div>

      {/* Top Engineering Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 text-xs">
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <span className="font-tech font-bold text-white text-base">Vx</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-tech font-bold text-sm tracking-wide text-white">
                  VOXELSYNC<span className="text-cyan-400">.IIOT</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700">
                  v2.4-CLOUD
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Industrial FDM Additive Cloud & Edge Command Center
              </div>
            </div>
          </div>

          {/* Active Printer Switcher Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setPrinterDropdownOpen(!printerDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 transition-colors text-slate-200"
            >
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-mono">ACTIVE MACHINE</div>
                <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activePrinter.status === 'printing' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {activePrinter.name}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {printerDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
                <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Connected Machines ({printers.length})
                </div>
                {printers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePrinterId(p.id);
                      setPrinterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-mono transition-colors ${
                      p.id === activePrinterId ? 'bg-cyan-500/20 text-cyan-200' : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.status === 'printing' ? 'bg-emerald-400' : p.status === 'warning' ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{p.model}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Utility Bar: DEMO DATA Pill, E-STOP, Audio, Notifications, User Profile */}
        <div className="flex items-center gap-2">
          {/* Prominent DEMO DATA Badge per Prompt Requirement */}
          {isDemoMode && (
            <button
              onClick={onOpenScenarioModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition-all shadow-sm shadow-amber-500/20 animate-pulse"
              title="Click to inject simulated faults and test scenarios"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              DEMO DATA
              <span className="text-[10px] font-normal text-amber-200/80 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40 hidden md:inline">
                SIMULATE
              </span>
            </button>
          )}

          {/* Emergency Stop Button */}
          <button
            onClick={onOpenEstopModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white font-tech font-bold text-xs shadow-lg shadow-rose-600/30 border border-rose-400/50 transition-all active:scale-95"
            title="Immediate Hardware Emergency Cutoff"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            E-STOP
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title={audioEnabled ? 'Alarm Sound: Enabled' : 'Alarm Sound: Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* User Profile & Role Switcher */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-cyan-400/60"
            />
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
              <div className="text-[9px] font-mono uppercase text-cyan-400 leading-none">{currentUser.role}</div>
            </div>
            <Shield className="w-3 h-3 text-cyan-400 hidden sm:block" />
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Desktop Navigation Ribbon */}
      <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 overflow-x-auto scrollbar-none text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : item.highlight
                  ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-mono border border-rose-500/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-3 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
            <button
              onClick={() => {
                onOpenUsbSsdModal?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 font-bold"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>USB / SSD CAD</span>
            </button>

            <button
              onClick={() => {
                onOpenCadDataModal?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-bold"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>CAD Data</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg text-left ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </div>
      )}

      {/* Global Sticky Fleet Print Progress Bar */}
      <FleetGlobalProgressBar onNavigateToFleet={() => setCurrentTab('fleet')} />
    </header>
  );
};
