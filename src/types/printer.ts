export type PrinterStatus = 'printing' | 'idle' | 'paused' | 'warning' | 'error' | 'offline';

export type UserRole = 'admin' | 'engineer' | 'operator' | 'viewer';

export interface EdgeGatewayInfo {
  type: 'Raspberry Pi 4' | 'ESP32 Node' | 'Direct Klipper USB';
  ip: string;
  pingMs: number;
  firmware: string;
  uptime: string;
  wifiSignalRssi?: number;
  cpuTemp?: number;
}

export interface PrintJob {
  id: string;
  fileName: string;
  fileSizeMb: number;
  startTime: string;
  totalDurationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  totalLayers: number;
  currentLayer: number;
  progressPercent: number;
  filamentTotalGrams: number;
  filamentUsedGrams: number;
  operator: string;
}

export interface PrinterTelemetry {
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  chamberTemp: number;
  chamberTarget: number;
  
  // Motion
  xPos: number;
  yPos: number;
  zPos: number;
  ePos: number;
  printSpeedMmS: number;
  feedratePercent: number;
  flowPercent: number;
  fanSpeedPercent: number;

  // G-code
  currentGcode: string;
  gcodeLine: number;
  totalGcodeLines: number;

  // Electrical & Physical
  powerWatts: number;
  voltageV: number;
  currentA: number;
  vibrationRms: number; // ADXL345 accelerometer (m/s^2)
  extrusionVolumetricMm3S: number;

  // Timing
  timestamp: string;
}

export interface TempHistoryPoint {
  timestamp: string;
  timeLabel: string;
  nozzle: number;
  nozzleTarget: number;
  bed: number;
  bedTarget: number;
  chamber: number;
}

export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'Nylon-CF';

export interface FilamentSpool {
  id: string;
  name: string;
  material: MaterialType;
  brand: string;
  colorName: string;
  colorHex: string;
  remainingGrams: number;
  totalGrams: number;
  remainingMeters?: number;
  diameterMm: number;
  densityGPerCm3: number;
  nozzleTempRecommended: [number, number];
  bedTempRecommended: [number, number];
  loaded: boolean;
  rfidTag?: string;
  runoutTriggered: boolean;
  jamDetected: boolean;
}

export interface SensorItem {
  id: string;
  name: string;
  type: 'nozzle_temp' | 'bed_temp' | 'chamber_temp' | 'filament_runout' | 'filament_jam' | 'vibration' | 'power_monitor' | 'door_interlock' | 'camera' | 'ambient_env';
  hardwareBus: string; // e.g., "I2C 0x68", "GPIO 17", "SPI-1"
  pinInterface?: string;
  machineId?: string;
  hostDevice: 'ESP32 Sensor Hub' | 'Raspberry Pi 4 Edge' | 'Mainboard STM32';
  reading: string | number;
  unit?: string;
  condition: 'normal' | 'warning' | 'critical' | 'offline';
  status: 'online' | 'offline' | 'degraded';
  rawDetail: string;
  lastUpdated: string;
}

export type FaultSeverity = 'information' | 'warning' | 'critical';
export type FaultStatus = 'active' | 'investigating' | 'resolved';

export interface FaultEvent {
  id: string;
  faultCode: string;
  faultType: string;
  severity: FaultSeverity;
  timestamp: string;
  machineId: string;
  machineName: string;
  description: string;
  possibleCause: string;
  recommendedAction: string;
  status: FaultStatus;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface PrintFile {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  layerCount: number;
  estimatedSeconds: number;
  filamentGrams: number;
  filamentMeters: number;
  material: MaterialType;
  materialRecommended?: string;
  slicer: string;
  version: string;
  uploadDate: string;
  description: string;
  assignedPrinterId?: string;
  printCount?: number;
}

export interface MaintenanceItem {
  id: string;
  component: string;
  description: string;
  currentHours: number;
  intervalHours: number;
  status: 'ok' | 'due_soon' | 'overdue';
  machineId?: string;
  lastServicedDate: string;
  recommendedAction: string;
}

export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  location: string;
  status: PrinterStatus;
  connectivity: 'online' | 'offline' | 'unstable';
  edgeGateway: EdgeGatewayInfo;
  activeFilament: FilamentSpool;
  currentJob: PrintJob | null;
  telemetry: PrinterTelemetry;
  lastMaintenanceDate: string;
  totalPrintHours: number;
  completedJobsCount: number;
  failedJobsCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  machineId?: string;
  category: 'temperature' | 'filament' | 'hardware' | 'job' | 'system' | 'ai';
}

export interface AiDiagnosticReport {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  overallHealthScore: number; // 0-100
  riskLevel: 'nominal' | 'low' | 'moderate' | 'high' | 'critical';
  headline: string;
  telemetryAnalysis: string;
  rootCauseAnalysis?: string;
  recommendedActions?: string[];
  preventativeSuggestion?: string;
  identifiedPatterns: Array<{
    title: string;
    probability: number;
    severity: FaultSeverity;
    evidence: string;
    possibleRootCause: string;
    recommendedMitigation: string;
  }>;
  visionInspection?: {
    spaghettiRisk: number; // 0 - 100%
    warpingRisk: number;
    layerShiftRisk: number;
    visualStatus: 'normal' | 'anomaly_suspected' | 'critical_failure';
    visualNotes: string;
  };
}
