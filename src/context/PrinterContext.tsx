import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import {
  PrinterDevice,
  PrinterStatus,
  UserRole,
  SensorItem,
  FaultEvent,
  PrintFile,
  MaintenanceItem,
  NotificationItem,
  TempHistoryPoint,
  FilamentSpool,
  AiDiagnosticReport,
} from '../types/printer';
import {
  INITIAL_PRINTERS,
  INITIAL_SENSORS,
  INITIAL_FAULTS,
  INITIAL_FILES,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_FILAMENTS,
  generateInitialTempHistory,
} from '../mock/printerData';

export type DemoScenario = 'normal' | 'thermal_runaway' | 'filament_jam' | 'high_vibration' | 'spaghetti_failure' | 'disconnected';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

interface PrinterContextType {
  // Fleet & Active Printer
  printers: PrinterDevice[];
  activePrinterId: string;
  activePrinter: PrinterDevice;
  setActivePrinterId: (id: string) => void;

  // Telemetry History
  tempHistory: TempHistoryPoint[];

  // Demo Mode & Scenarios
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeScenario: DemoScenario;
  injectScenario: (scenario: DemoScenario) => void;

  // Sensors & Filaments
  sensors: SensorItem[];
  filaments: FilamentSpool[];
  loadFilamentToPrinter: (spoolId: string) => void;
  unloadFilament: () => void;
  updateSensorCalibration: (sensorId: string, calibrationNote: string) => void;

  // Faults & Alerts
  faults: FaultEvent[];
  activeFaultsCount: number;
  resolveFault: (faultId: string) => void;
  acknowledgeFault: (faultId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotifAsRead: (id: string) => void;
  markAllNotifsAsRead: () => void;
  clearNotification: (id: string) => void;
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;

  // User & RBAC
  currentUser: { name: string; email: string; role: UserRole; avatar: string };
  setUserRole: (role: UserRole) => void;
  canExecuteControl: boolean;
  auditLogs: AuditLogItem[];

  // Remote Machine Controls
  startJob: (fileId?: string) => void;
  pauseJob: () => void;
  resumeJob: () => void;
  cancelJob: () => void;
  emergencyStop: () => void;
  setTargetTemp: (type: 'nozzle' | 'bed' | 'chamber', temp: number) => void;
  setSpeedMultiplier: (percent: number) => void;
  setFlowMultiplier: (percent: number) => void;
  jogAxis: (axis: 'X' | 'Y' | 'Z' | 'E', deltaMm: number) => void;
  homeAxis: (axis: 'ALL' | 'X' | 'Y' | 'Z') => void;
  preheatPreset: (material: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'COOLDOWN') => void;

  // File Management
  files: PrintFile[];
  uploadPrintFile: (file: Omit<PrintFile, 'id' | 'uploadDate'>) => void;
  deletePrintFile: (id: string) => void;
  assignFileToPrinter: (fileId: string, printerId: string) => void;

  // Maintenance
  maintenanceList: MaintenanceItem[];
  performMaintenance: (itemId: string) => void;

  // AI Diagnostic State
  aiReport: AiDiagnosticReport | null;
  isAiDiagnosing: boolean;
  runAiDiagnostics: () => Promise<void>;

  // Edge Gateway Live Serial Console
  serialLogs: string[];
}

const PrinterContext = createContext<PrinterContextType | null>(null);

// Web Audio chime generator (runs purely in browser without external assets)
function playIndustrialChime(type: 'info' | 'warning' | 'critical' | 'click' | 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'critical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'warning') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, now);
      osc.frequency.setValueAtTime(740, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Ignore audio permission restrictions before user interaction
  }
}

export const PrinterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [printers, setPrinters] = useState<PrinterDevice[]>(INITIAL_PRINTERS);
  const [activePrinterId, setActivePrinterId] = useState<string>('PRUSA-FDM-01');
  const [tempHistory, setTempHistory] = useState<TempHistoryPoint[]>(generateInitialTempHistory);
  const [sensors, setSensors] = useState<SensorItem[]>(INITIAL_SENSORS);
  const [filaments, setFilaments] = useState<FilamentSpool[]>(INITIAL_FILAMENTS);
  const [faults, setFaults] = useState<FaultEvent[]>(INITIAL_FAULTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [files, setFiles] = useState<PrintFile[]>(INITIAL_FILES);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('normal');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // User Profile & RBAC
  const [currentUser, setCurrentUser] = useState({
    name: 'Avinash',
    email: 'avinashrcb026@gmail.com',
    role: 'engineer' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Avinash (Lead Engineer)',
      role: 'engineer',
      action: 'START_PRINT',
      details: 'Dispatched bracket_reinforced_v3.gcode to PRUSA-FDM-01',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      user: 'Avinash (Lead Engineer)',
      role: 'engineer',
      action: 'SPEED_OVERRIDE',
      details: 'Adjusted feedrate to 100% after first layer inspection',
    },
  ]);

  // AI Diagnostic State
  const [aiReport, setAiReport] = useState<AiDiagnosticReport | null>(null);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState<boolean>(false);

  // Edge Gateway Console Logs
  const [serialLogs, setSerialLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [ESP32-Hub] Boot OK. I2C Bus scan: 0x40 (INA219), 0x76 (BME280) online.`,
    `[${new Date().toLocaleTimeString()}] [Pi4-Edge] Klipper serial bridge opened on /dev/ttyUSB0 (115200 baud).`,
    `[${new Date().toLocaleTimeString()}] [Cloud-MQTT] Connected to ssl://mqtt.voxelsync.internal:8883 (Keepalive 30s).`,
    `[${new Date().toLocaleTimeString()}] [Telemetry] PRUSA-FDM-01: T:205.4 /210.0 B:60.1 /60.0 @:62`,
  ]);

  const activePrinter = useMemo(() => {
    return printers.find((p) => p.id === activePrinterId) || printers[0];
  }, [printers, activePrinterId]);

  // Role permissions check
  const canExecuteControl = useMemo(() => {
    return currentUser.role === 'admin' || currentUser.role === 'engineer' || currentUser.role === 'operator';
  }, [currentUser.role]);

  // Push audit log helper
  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      role: currentUser.role,
      action,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  // Push Notification helper
  const sendNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
    if (audioEnabled) {
      playIndustrialChime(notif.severity);
    }
  };

  // Real-time telemetry simulation ticker (Runs every 1.5s)
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setPrinters((prevPrinters) => {
        return prevPrinters.map((printer) => {
          if (printer.id !== activePrinterId) return printer;

          let { telemetry, currentJob, status, activeFilament } = printer;

          // If printer is disconnected scenario
          if (activeScenario === 'disconnected') {
            return {
              ...printer,
              status: 'offline',
              connectivity: 'offline',
            };
          }

          // If printer is printing, progress the job
          if (status === 'printing' && currentJob) {
            const newElapsed = currentJob.elapsedSeconds + 2;
            const newProgress = Math.min(100, Number(((newElapsed / currentJob.totalDurationSeconds) * 100).toFixed(1)));
            const newRemaining = Math.max(0, currentJob.totalDurationSeconds - newElapsed);
            const newLayer = Math.min(currentJob.totalLayers, Math.floor((newProgress / 100) * currentJob.totalLayers) + 1);
            const newFilamentUsed = Number(((newProgress / 100) * currentJob.filamentTotalGrams).toFixed(1));

            // Dynamic XY motion simulation
            const targetX = 100 + Math.sin(Date.now() / 400) * 45;
            const targetY = 90 + Math.cos(Date.now() / 350) * 40;
            const targetZ = Number((newLayer * 0.2).toFixed(2));
            const targetE = Number((telemetry.ePos + 0.15).toFixed(2));

            // Temperature physics simulation with PID hysteresis
            let targetNozzle = telemetry.nozzleTarget;
            let targetBed = telemetry.bedTarget;

            let actualNozzle = telemetry.nozzleTemp;
            let actualBed = telemetry.bedTemp;

            if (activeScenario === 'thermal_runaway') {
              // Simulate dangerous temperature drift above setpoint
              actualNozzle = Number((actualNozzle + 0.8).toFixed(1));
              actualBed = Number((actualBed + 0.2).toFixed(1));
            } else if (activeScenario === 'filament_jam') {
              // Normal temp, but extrusion flow collapses and slip increases
              actualNozzle = Number((targetNozzle + (Math.random() - 0.5) * 0.8).toFixed(1));
              actualBed = Number((targetBed + (Math.random() - 0.5) * 0.3).toFixed(1));
            } else {
              // Natural closed-loop PID minor jitter (±0.4°C)
              actualNozzle = Number((targetNozzle + (Math.random() - 0.5) * 0.7).toFixed(1));
              actualBed = Number((targetBed + (Math.random() - 0.5) * 0.3).toFixed(1));
            }

            const updatedTelemetry = {
              ...telemetry,
              nozzleTemp: actualNozzle,
              bedTemp: actualBed,
              xPos: Number(targetX.toFixed(1)),
              yPos: Number(targetY.toFixed(1)),
              zPos: targetZ,
              ePos: targetE,
              vibrationRms: activeScenario === 'high_vibration' ? Number((1.8 + Math.random() * 0.6).toFixed(2)) : Number((0.15 + Math.random() * 0.08).toFixed(2)),
              extrusionVolumetricMm3S: activeScenario === 'filament_jam' ? 0.4 : Number((8.2 + Math.random() * 0.5).toFixed(1)),
              powerWatts: Number((140 + Math.random() * 15).toFixed(1)),
              currentGcode: `G1 X${targetX.toFixed(2)} Y${targetY.toFixed(2)} E${targetE.toFixed(2)} F4800`,
              gcodeLine: Math.min(telemetry.totalGcodeLines, telemetry.gcodeLine + 3),
              timestamp: new Date().toISOString(),
            };

            const updatedJob = {
              ...currentJob,
              elapsedSeconds: newElapsed,
              remainingSeconds: newRemaining,
              progressPercent: newProgress,
              currentLayer: newLayer,
              filamentUsedGrams: newFilamentUsed,
            };

            return {
              ...printer,
              telemetry: updatedTelemetry,
              currentJob: updatedJob,
            };
          }

          // If idle or paused, temperatures gradually approach target
          const targetNozzle = telemetry.nozzleTarget;
          const targetBed = telemetry.bedTarget;
          const coolNozzle = Number((telemetry.nozzleTemp + (targetNozzle - telemetry.nozzleTemp) * 0.1).toFixed(1));
          const coolBed = Number((telemetry.bedTemp + (targetBed - telemetry.bedTemp) * 0.1).toFixed(1));

          return {
            ...printer,
            telemetry: {
              ...telemetry,
              nozzleTemp: coolNozzle,
              bedTemp: coolBed,
              timestamp: new Date().toISOString(),
            },
          };
        });
      });

      // Update temperature history graph
      setTempHistory((prev) => {
        const currentActive = printers.find((p) => p.id === activePrinterId);
        if (!currentActive) return prev;
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint: TempHistoryPoint = {
          timestamp: now.toISOString(),
          timeLabel,
          nozzle: currentActive.telemetry.nozzleTemp,
          nozzleTarget: currentActive.telemetry.nozzleTarget,
          bed: currentActive.telemetry.bedTemp,
          bedTarget: currentActive.telemetry.bedTarget,
          chamber: currentActive.telemetry.chamberTemp,
        };
        return [...prev.slice(1), newPoint];
      });

      // Update live serial log
      setSerialLogs((prev) => {
        const active = printers.find((p) => p.id === activePrinterId);
        if (!active) return prev;
        const t = new Date().toLocaleTimeString();
        const line = `[${t}] [${active.id}] T:${active.telemetry.nozzleTemp}/${active.telemetry.nozzleTarget} B:${active.telemetry.bedTemp}/${active.telemetry.bedTarget} X:${active.telemetry.xPos} Y:${active.telemetry.yPos} Z:${active.telemetry.zPos}`;
        return [...prev.slice(-40), line];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isDemoMode, activePrinterId, activeScenario, printers]);

  // Scenario Injection Method
  const injectScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario);
    const now = new Date().toISOString();

    if (scenario === 'normal') {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === activePrinterId
            ? {
                ...p,
                status: 'printing',
                connectivity: 'online',
                telemetry: {
                  ...p.telemetry,
                  nozzleTarget: 210,
                  nozzleTemp: 210,
                  bedTarget: 60,
                  bedTemp: 60,
                  vibrationRms: 0.18,
                  extrusionVolumetricMm3S: 8.4,
                },
              }
            : p
        )
      );
      sendNotification({
        title: 'Scenario Reset: Normal Printing',
        message: 'Printer operating parameters restored to nominal closed-loop state.',
        severity: 'info',
        category: 'system',
        machineId: activePrinterId,
      });
      addAuditLog('SCENARIO_INJECT', 'Restored nominal printing scenario');
    } else if (scenario === 'thermal_runaway') {
      const faultId = `FLT-${Date.now()}`;
      const newFault: FaultEvent = {
        id: faultId,
        faultCode: 'THERMAL-RUNAWAY-ERR',
        faultType: 'Thermal Runaway & Uncontrolled Hotend Heating',
        severity: 'critical',
        timestamp: now,
        machineId: activePrinterId,
        machineName: activePrinter.name,
        description: 'Hotend heater continuous duty cycle failed to regulate. Temperature exceeding 235°C without target command.',
        possibleCause: 'Short-circuited MOSFET on mainboard or loose thermistor cartridge dislodged from heater block.',
        recommendedAction: 'Trigger EMERGENCY STOP immediately. Cut AC power switch and inspect heater cartridge resistance with multimeter.',
        status: 'active',
      };
      setFaults((prev) => [newFault, ...prev]);
      sendNotification({
        title: 'CRITICAL: Thermal Runaway Detected',
        message: `${activePrinter.name} hotend temperature is rising uncontrollably! Automatic cutoff armed.`,
        severity: 'critical',
        category: 'temperature',
        machineId: activePrinterId,
      });
      addAuditLog('FAULT_DETECTED', `Critical Thermal Runaway condition on ${activePrinter.name}`);
    } else if (scenario === 'filament_jam') {
      const faultId = `FLT-${Date.now()}`;
      const newFault: FaultEvent = {
        id: faultId,
        faultCode: 'EXT-JAM-RUNOUT',
        faultType: 'Filament Jam & Extruder Gear Grinding',
        severity: 'warning',
        timestamp: now,
        machineId: activePrinterId,
        machineName: activePrinter.name,
        description: 'Magnetic rotary encoder detected zero filament advance for 4.2 seconds while E-motor was commanded at 45mm/s.',
        possibleCause: 'Heat creep swelling filament in cold zone or knotted spool snagging on spool holder.',
        recommendedAction: 'Pause print, raise nozzle temp to 240°C, and perform cold-pull purge or un-tangle spool.',
        status: 'active',
      };
      setFaults((prev) => [newFault, ...prev]);
      sendNotification({
        title: 'WARNING: Filament Jam Detected',
        message: `${activePrinter.name} extrusion encoder registered 92% slip ratio. Feed stalled.`,
        severity: 'warning',
        category: 'filament',
        machineId: activePrinterId,
      });
      addAuditLog('FAULT_DETECTED', `Filament Jam anomaly logged for ${activePrinter.name}`);
    } else if (scenario === 'high_vibration') {
      const faultId = `FLT-${Date.now()}`;
      const newFault: FaultEvent = {
        id: faultId,
        faultCode: 'MECH-VIB-SPIKE',
        faultType: 'Excessive Toolhead Vibration & Belt Resonance',
        severity: 'warning',
        timestamp: now,
        machineId: activePrinterId,
        machineName: activePrinter.name,
        description: 'ADXL345 accelerometer registered 2.4 m/s² RMS vibration spike during Y-axis high-speed infill moves.',
        possibleCause: 'Y-axis GT2 belt tension has dropped below 38Hz or linear bearing retainer is loose.',
        recommendedAction: 'Reduce print acceleration to 1500 mm/s² and retension Y-axis belt after current print completes.',
        status: 'active',
      };
      setFaults((prev) => [newFault, ...prev]);
      sendNotification({
        title: 'Warning: Mechanical Resonance Spike',
        message: `${activePrinter.name} vibration exceeded industrial threshold (2.4 m/s² RMS).`,
        severity: 'warning',
        category: 'hardware',
        machineId: activePrinterId,
      });
      addAuditLog('FAULT_DETECTED', `Excessive vibration alert on ${activePrinter.name}`);
    } else if (scenario === 'spaghetti_failure') {
      const faultId = `FLT-${Date.now()}`;
      const newFault: FaultEvent = {
        id: faultId,
        faultCode: 'CV-SPAGHETTI-01',
        faultType: 'Computer Vision: Spaghetti Print Detachment',
        severity: 'critical',
        timestamp: now,
        machineId: activePrinterId,
        machineName: activePrinter.name,
        description: 'Sony IMX219 camera AI vision model detected 91% probability of unbounded extruded strands on build plate.',
        possibleCause: 'Part detached from PEI bed sheet due to insufficient bed temperature or oily fingerprint contamination.',
        recommendedAction: 'Verify visual stream in Live Camera, abort print to save filament, and clean bed with 99% Isopropanol.',
        status: 'active',
      };
      setFaults((prev) => [newFault, ...prev]);
      sendNotification({
        title: 'CRITICAL: Spaghetti Failure Detected',
        message: 'Camera AI model identified loose plastic accumulation on build plate.',
        severity: 'critical',
        category: 'ai',
        machineId: activePrinterId,
      });
      addAuditLog('FAULT_DETECTED', `AI Vision flagged spaghetti failure on ${activePrinter.name}`);
    } else if (scenario === 'disconnected') {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === activePrinterId ? { ...p, status: 'offline', connectivity: 'offline' } : p
        )
      );
      sendNotification({
        title: 'Printer Offline: Edge Heartbeat Lost',
        message: `${activePrinter.name} lost communication with cloud broker. Checking local watchdog.`,
        severity: 'critical',
        category: 'system',
        machineId: activePrinterId,
      });
      addAuditLog('CONNECTIVITY_LOST', `Edge heartbeat timeout on ${activePrinter.name}`);
    }
  };

  // Remote Control Handlers
  const startJob = (fileId?: string) => {
    if (!canExecuteControl) return;
    const file = files.find((f) => f.id === fileId) || files[0];
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          status: 'printing',
          currentJob: {
            id: `JOB-${Date.now()}`,
            fileName: file.fileName,
            fileSizeMb: Number((file.fileSizeBytes / (1024 * 1024)).toFixed(1)),
            startTime: new Date().toISOString(),
            totalDurationSeconds: file.estimatedSeconds,
            elapsedSeconds: 0,
            remainingSeconds: file.estimatedSeconds,
            totalLayers: file.layerCount,
            currentLayer: 1,
            progressPercent: 0,
            filamentTotalGrams: file.filamentGrams,
            filamentUsedGrams: 0,
            operator: currentUser.name,
          },
          telemetry: {
            ...p.telemetry,
            nozzleTarget: p.activeFilament.nozzleTempRecommended[0],
            bedTarget: p.activeFilament.bedTempRecommended[0],
            printSpeedMmS: 60,
          },
        };
      })
    );
    sendNotification({
      title: 'Print Job Started',
      message: `${file.fileName} dispatched to ${activePrinter.name}. Heating bed & nozzle...`,
      severity: 'info',
      category: 'job',
      machineId: activePrinterId,
    });
    addAuditLog('START_JOB', `Started ${file.fileName} on ${activePrinter.name}`);
  };

  const pauseJob = () => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => (p.id === activePrinterId ? { ...p, status: 'paused' } : p))
    );
    sendNotification({
      title: 'Print Paused',
      message: `${activePrinter.name} execution paused. Toolhead parked at safe coordinates.`,
      severity: 'warning',
      category: 'job',
      machineId: activePrinterId,
    });
    addAuditLog('PAUSE_PRINT', `Paused print on ${activePrinter.name}`);
  };

  const resumeJob = () => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => (p.id === activePrinterId ? { ...p, status: 'printing' } : p))
    );
    sendNotification({
      title: 'Print Resumed',
      message: `${activePrinter.name} resumed execution.`,
      severity: 'info',
      category: 'job',
      machineId: activePrinterId,
    });
    addAuditLog('RESUME_PRINT', `Resumed print on ${activePrinter.name}`);
  };

  const cancelJob = () => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === activePrinterId
          ? {
              ...p,
              status: 'idle',
              currentJob: null,
              telemetry: { ...p.telemetry, nozzleTarget: 0, bedTarget: 0, printSpeedMmS: 0 },
            }
          : p
      )
    );
    sendNotification({
      title: 'Print Job Aborted',
      message: `Print on ${activePrinter.name} was stopped by ${currentUser.name}. Heaters off.`,
      severity: 'warning',
      category: 'job',
      machineId: activePrinterId,
    });
    addAuditLog('CANCEL_JOB', `Aborted active print on ${activePrinter.name}`);
  };

  const emergencyStop = () => {
    // Emergency stop can be pressed by anyone for safety reasons!
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === activePrinterId
          ? {
              ...p,
              status: 'error',
              currentJob: null,
              telemetry: {
                ...p.telemetry,
                nozzleTarget: 0,
                bedTarget: 0,
                chamberTarget: 0,
                printSpeedMmS: 0,
                powerWatts: 8.5,
              },
            }
          : p
      )
    );
    sendNotification({
      title: 'EMERGENCY STOP EXECUTED',
      message: `Hardware Kill M112 sent to ${activePrinter.name}. All stepper drivers and heaters cut instantly!`,
      severity: 'critical',
      category: 'hardware',
      machineId: activePrinterId,
    });
    addAuditLog('EMERGENCY_STOP', `ESTOP triggered on ${activePrinter.name} by ${currentUser.name}`);
  };

  const setTargetTemp = (type: 'nozzle' | 'bed' | 'chamber', temp: number) => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            nozzleTarget: type === 'nozzle' ? temp : p.telemetry.nozzleTarget,
            bedTarget: type === 'bed' ? temp : p.telemetry.bedTarget,
            chamberTarget: type === 'chamber' ? temp : p.telemetry.chamberTarget,
          },
        };
      })
    );
    addAuditLog('SET_TEMP', `Set ${type} target to ${temp}°C on ${activePrinter.name}`);
  };

  const setSpeedMultiplier = (percent: number) => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            feedratePercent: percent,
            printSpeedMmS: Number(((60 * percent) / 100).toFixed(1)),
          },
        };
      })
    );
    addAuditLog('SET_SPEED', `Adjusted feedrate multiplier to ${percent}% on ${activePrinter.name}`);
  };

  const setFlowMultiplier = (percent: number) => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            flowPercent: percent,
          },
        };
      })
    );
    addAuditLog('SET_FLOW', `Adjusted extrusion flow multiplier to ${percent}% on ${activePrinter.name}`);
  };

  const jogAxis = (axis: 'X' | 'Y' | 'Z' | 'E', deltaMm: number) => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        const currentVal =
          axis === 'X'
            ? p.telemetry.xPos
            : axis === 'Y'
            ? p.telemetry.yPos
            : axis === 'Z'
            ? p.telemetry.zPos
            : p.telemetry.ePos;
        const newVal = Math.max(0, Number((currentVal + deltaMm).toFixed(2)));

        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            xPos: axis === 'X' ? newVal : p.telemetry.xPos,
            yPos: axis === 'Y' ? newVal : p.telemetry.yPos,
            zPos: axis === 'Z' ? newVal : p.telemetry.zPos,
            ePos: axis === 'E' ? newVal : p.telemetry.ePos,
          },
        };
      })
    );
    addAuditLog('JOG_AXIS', `Jogged ${axis} by ${deltaMm > 0 ? '+' : ''}${deltaMm}mm on ${activePrinter.name}`);
  };

  const homeAxis = (axis: 'ALL' | 'X' | 'Y' | 'Z') => {
    if (!canExecuteControl) return;
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            xPos: axis === 'ALL' || axis === 'X' ? 0 : p.telemetry.xPos,
            yPos: axis === 'ALL' || axis === 'Y' ? 0 : p.telemetry.yPos,
            zPos: axis === 'ALL' || axis === 'Z' ? 0 : p.telemetry.zPos,
          },
        };
      })
    );
    sendNotification({
      title: 'Axes Homed',
      message: `Homing command G28 ${axis === 'ALL' ? '' : axis} executed successfully.`,
      severity: 'info',
      category: 'hardware',
      machineId: activePrinterId,
    });
    addAuditLog('HOME_AXES', `Homed ${axis} on ${activePrinter.name}`);
  };

  const preheatPreset = (material: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'COOLDOWN') => {
    if (!canExecuteControl) return;
    let nozzle = 0;
    let bed = 0;
    if (material === 'PLA') {
      nozzle = 215;
      bed = 60;
    } else if (material === 'PETG') {
      nozzle = 240;
      bed = 80;
    } else if (material === 'ABS') {
      nozzle = 255;
      bed = 105;
    } else if (material === 'TPU') {
      nozzle = 225;
      bed = 50;
    }

    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== activePrinterId) return p;
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            nozzleTarget: nozzle,
            bedTarget: bed,
          },
        };
      })
    );
    sendNotification({
      title: `Preheat Profile: ${material}`,
      message: `Set targets — Hotend: ${nozzle}°C | Bed: ${bed}°C on ${activePrinter.name}`,
      severity: 'info',
      category: 'temperature',
      machineId: activePrinterId,
    });
    addAuditLog('PREHEAT_PRESET', `Applied preset ${material} (${nozzle}°C / ${bed}°C)`);
  };

  // Filament Operations
  const loadFilamentToPrinter = (spoolId: string) => {
    const spool = filaments.find((f) => f.id === spoolId);
    if (!spool) return;

    setFilaments((prev) =>
      prev.map((f) => ({ ...f, loaded: f.id === spoolId }))
    );

    setPrinters((prev) =>
      prev.map((p) =>
        p.id === activePrinterId ? { ...p, activeFilament: { ...spool, loaded: true } } : p
      )
    );

    sendNotification({
      title: 'Filament Spool Loaded',
      message: `${spool.name} (${spool.material}) loaded to ${activePrinter.name}. Remaining: ${spool.remainingGrams}g`,
      severity: 'success',
      category: 'filament',
      machineId: activePrinterId,
    });
    addAuditLog('FILAMENT_LOAD', `Loaded ${spool.name} to ${activePrinter.name}`);
  };

  const unloadFilament = () => {
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === activePrinterId
          ? {
              ...p,
              activeFilament: {
                ...p.activeFilament,
                loaded: false,
              },
            }
          : p
      )
    );
    sendNotification({
      title: 'Filament Unloaded',
      message: `Filament removed from ${activePrinter.name}. Feed path clear.`,
      severity: 'info',
      category: 'filament',
      machineId: activePrinterId,
    });
    addAuditLog('FILAMENT_UNLOAD', `Unloaded filament from ${activePrinter.name}`);
  };

  // Sensor Calibration
  const updateSensorCalibration = (sensorId: string, calibrationNote: string) => {
    setSensors((prev) =>
      prev.map((s) =>
        s.id === sensorId
          ? {
              ...s,
              rawDetail: `${calibrationNote} (Calibrated on ${new Date().toLocaleDateString()})`,
              condition: 'normal',
            }
          : s
      )
    );
    sendNotification({
      title: 'Sensor Calibrated',
      message: `Calibration parameters updated for ${sensorId}. Zero-point baseline stored.`,
      severity: 'success',
      category: 'hardware',
    });
    addAuditLog('SENSOR_CALIBRATE', `Calibrated sensor ${sensorId}`);
  };

  // Fault Management
  const resolveFault = (faultId: string) => {
    setFaults((prev) =>
      prev.map((f) =>
        f.id === faultId
          ? {
              ...f,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser.name,
            }
          : f
      )
    );
    sendNotification({
      title: 'Fault Cleared & Resolved',
      message: `Fault ${faultId} marked resolved by ${currentUser.name}. Machine interlocks restored.`,
      severity: 'success',
      category: 'system',
    });
    addAuditLog('RESOLVE_FAULT', `Resolved fault ${faultId}`);
  };

  const acknowledgeFault = (faultId: string) => {
    setFaults((prev) =>
      prev.map((f) => (f.id === faultId ? { ...f, status: 'investigating' } : f))
    );
    addAuditLog('ACKNOWLEDGE_FAULT', `Under investigation: ${faultId}`);
  };

  // Notifications
  const markNotifAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // User Profile
  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    sendNotification({
      title: 'User Role Switched',
      message: `Permissions updated to ${role.toUpperCase()} mode.`,
      severity: 'info',
      category: 'system',
    });
    addAuditLog('ROLE_CHANGE', `Switched role to ${role}`);
  };

  // File Operations
  const uploadPrintFile = (newFile: Omit<PrintFile, 'id' | 'uploadDate'>) => {
    const item: PrintFile = {
      ...newFile,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setFiles((prev) => [item, ...prev]);
    sendNotification({
      title: 'G-Code File Uploaded',
      message: `${item.fileName} parsed: ${item.layerCount} layers, ~${Math.round(item.estimatedSeconds / 60)} min.`,
      severity: 'success',
      category: 'job',
    });
    addAuditLog('UPLOAD_FILE', `Uploaded print file ${item.fileName}`);
  };

  const deletePrintFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    addAuditLog('DELETE_FILE', `Deleted print file ${id}`);
  };

  const assignFileToPrinter = (fileId: string, printerId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, assignedPrinterId: printerId } : f))
    );
    sendNotification({
      title: 'Job Assigned to Printer',
      message: `File queued for ${printerId}. Ready to start print.`,
      severity: 'info',
      category: 'job',
    });
    addAuditLog('ASSIGN_FILE', `Assigned file ${fileId} to ${printerId}`);
  };

  // Maintenance
  const performMaintenance = (itemId: string) => {
    setMaintenanceList((prev) =>
      prev.map((m) =>
        m.id === itemId
          ? {
              ...m,
              currentHours: 0,
              status: 'ok',
              lastServicedDate: new Date().toISOString().split('T')[0],
            }
          : m
      )
    );
    sendNotification({
      title: 'Maintenance Logged',
      message: `Component serviced and operating hour counter reset to 0h.`,
      severity: 'success',
      category: 'hardware',
    });
    addAuditLog('MAINTENANCE_PERFORMED', `Serviced maintenance item ${itemId}`);
  };

  // AI Diagnostics Execution
  const runAiDiagnostics = async () => {
    setIsAiDiagnosing(true);
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: activePrinter.id,
          machineName: activePrinter.name,
          telemetry: activePrinter.telemetry,
          activeFaults: faults.filter((f) => f.machineId === activePrinter.id && f.status === 'active'),
          sensorSummary: sensors.map((s) => ({ name: s.name, reading: s.reading, condition: s.condition })),
          visionState: {
            anomaly: activeScenario === 'spaghetti_failure' ? 'spaghetti' : 'none',
          },
          currentJob: activePrinter.currentJob,
        }),
      });

      if (response.ok) {
        const report = await response.json();
        setAiReport(report);
        sendNotification({
          title: 'AI Diagnostic Analysis Complete',
          message: `Health Score: ${report.overallHealthScore}/100. Status: ${report.riskLevel.toUpperCase()}`,
          severity: report.riskLevel === 'nominal' ? 'info' : 'warning',
          category: 'ai',
          machineId: activePrinter.id,
        });
      }
    } catch (err) {
      console.error('AI diagnosis request failed:', err);
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  const activeFaultsCount = useMemo(() => {
    return faults.filter((f) => f.status === 'active').length;
  }, [faults]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <PrinterContext.Provider
      value={{
        printers,
        activePrinterId,
        activePrinter,
        setActivePrinterId,
        tempHistory,
        isDemoMode,
        setIsDemoMode,
        activeScenario,
        injectScenario,
        sensors,
        filaments,
        loadFilamentToPrinter,
        unloadFilament,
        updateSensorCalibration,
        faults,
        activeFaultsCount,
        resolveFault,
        acknowledgeFault,
        notifications,
        unreadNotifsCount,
        markNotifAsRead,
        markAllNotifsAsRead,
        clearNotification,
        sendNotification,
        audioEnabled,
        setAudioEnabled,
        currentUser,
        setUserRole,
        canExecuteControl,
        auditLogs,
        startJob,
        pauseJob,
        resumeJob,
        cancelJob,
        emergencyStop,
        setTargetTemp,
        setSpeedMultiplier,
        setFlowMultiplier,
        jogAxis,
        homeAxis,
        preheatPreset,
        files,
        uploadPrintFile,
        deletePrintFile,
        assignFileToPrinter,
        maintenanceList,
        performMaintenance,
        aiReport,
        isAiDiagnosing,
        runAiDiagnostics,
        serialLogs,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
};
